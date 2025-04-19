import { NextResponse } from 'next/server';
import pool from '@/lib/db/database';

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Validate form_id exists
      const formCheck = await client.query(
        `SELECT form_id FROM forms WHERE form_id = $1 AND status_id = 1`, // Check if form is active
        [formData.formId]
      );

      if (formCheck.rows.length === 0) {
        throw new Error('Invalid form ID or form is not active');
      }

      // 1. Check if customer exists
      const customerCheck = await client.query(
        `SELECT customer_id FROM customer WHERE email = $1 AND email IS NOT NULL`,
        [formData.personalDetails.email]
      );

      let customerId;
      if (customerCheck.rows.length > 0 && formData.personalDetails.email) {
        // Update existing customer only if email is provided
        const updateResult = await client.query(
          `UPDATE customer 
           SET phone = $1, 
               sex = $2, 
               name = $3,
               customer_type_id = (SELECT cust_type_id FROM customer_type WHERE cust_type_name = $4),
               external_type_id = (SELECT external_type_id FROM external_customer_type WHERE external_type_name = $5)
           WHERE email = $6
           RETURNING customer_id`,
          [
            formData.personalDetails.contact,
            formData.personalDetails.sex,
            formData.personalDetails.name || null,
            formData.personalDetails.customerType,
            formData.personalDetails.externalType,
            formData.personalDetails.email
          ]
        );
        customerId = updateResult.rows[0].customer_id;
      } else {
        // Insert new customer
        const insertResult = await client.query(
          `INSERT INTO customer (email, phone, sex, name, customer_type_id, external_type_id)
           VALUES ($1, $2, $3, $4, 
             (SELECT cust_type_id FROM customer_type WHERE cust_type_name = $5),
             (SELECT external_type_id FROM external_customer_type WHERE external_type_name = $6)
           )
           RETURNING customer_id`,
          [
            formData.personalDetails.email || null,
            formData.personalDetails.contact || null,
            formData.personalDetails.sex || null,
            formData.personalDetails.name || null,
            formData.personalDetails.customerType || 'Individual', // Default value if not provided
            formData.personalDetails.externalType || 'External' // Default value if not provided
          ]
        );
        customerId = insertResult.rows[0].customer_id;
      }

      // Transform question numbers to question_ids
      const transformRatings = (ratings) => {
        const transformed = {};
        for (const [key, value] of Object.entries(ratings)) {
          const questionNumber = key.replace('question', '');
          transformed[questionNumber] = value;
        }
        return transformed;
      };

      // Clean up form data before storing
      const cleanFormData = formData.formId === 1 ? {
        csmARTACheckmark: {
          selectedOption: formData.csmARTACheckmark?.selectedOption,
          additionalAnswers: formData.csmARTACheckmark?.additionalAnswers
        },
        csmARTARatings: {
          ratings: formData.csmARTARatings?.ratings ? transformRatings(formData.csmARTARatings.ratings) : {}
        },
        suggestion: {
          generalComments: formData.suggestion?.generalComments,
          reasonForLowScore: formData.suggestion?.reasonForLowScore
        }
      } : {
        qmsCheckmark: {
          selections: formData.qmsCheckmark?.selections
        },
        qmsRatings: {
          ratings: formData.qmsRatings?.ratings ? transformRatings(formData.qmsRatings.ratings) : {}
        },
        suggestion: {
          generalComments: formData.suggestion?.generalComments,
          reasonForLowScore: formData.suggestion?.reasonForLowScore
        }
      };

      // 2. Insert response
      const responseResult = await client.query(
        `INSERT INTO responses (
          form_id,
          service_id,
          customer_id,
          submitted_at,
          answers
        ) VALUES ($1, $2, $3, NOW(), $4)
        RETURNING response_id`,
        [
          formData.formId,
          formData.personalDetails.service_id,
          customerId,
          JSON.stringify(cleanFormData)
        ]
      );

      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        responseId: responseResult.rows[0].response_id 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit form' },
      { status: 500 }
    );
  }
} 