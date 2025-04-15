import { NextResponse } from 'next/server';
import pool from '@/lib/db/database';

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Check if customer exists
      const customerCheck = await client.query(
        `SELECT customer_id FROM customer WHERE email = $1`,
        [formData.personalDetails.email]
      );

      let customerId;
      if (customerCheck.rows.length > 0) {
        // Update existing customer
        const updateResult = await client.query(
          `UPDATE customer 
           SET phone = $1, 
               sex = $2, 
               customer_type_id = (SELECT cust_type_id FROM customer_type WHERE cust_type_name = $3),
               external_type_id = (SELECT external_type_id FROM external_customer_type WHERE external_type_name = $4)
           WHERE email = $5
           RETURNING customer_id`,
          [
            formData.personalDetails.contact,
            formData.personalDetails.sex,
            formData.personalDetails.customerType,
            formData.personalDetails.externalType,
            formData.personalDetails.email
          ]
        );
        customerId = updateResult.rows[0].customer_id;
      } else {
        // Insert new customer
        const insertResult = await client.query(
          `INSERT INTO customer (email, phone, sex, customer_type_id, external_type_id)
           VALUES ($1, $2, $3, 
             (SELECT cust_type_id FROM customer_type WHERE cust_type_name = $4),
             (SELECT external_type_id FROM external_customer_type WHERE external_type_name = $5)
           )
           RETURNING customer_id`,
          [
            formData.personalDetails.email,
            formData.personalDetails.contact,
            formData.personalDetails.sex,
            formData.personalDetails.customerType,
            formData.personalDetails.externalType
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
      const cleanFormData = {
        csmARTACheckmark: {
          selectedOption: formData.csmARTACheckmark.selectedOption,
          additionalAnswers: formData.csmARTACheckmark.additionalAnswers
        },
        csmARTARatings: {
          ratings: transformRatings(formData.csmARTARatings.ratings)
        },
        qmsCheckmark: {
          selections: formData.qmsCheckmark.selections
        },
        qmsRatings: {
          ratings: transformRatings(formData.qmsRatings.ratings)
        },
        suggestion: {
          generalComments: formData.suggestion.generalComments,
          reasonForLowScore: formData.suggestion.reasonForLowScore
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
          formData.serviceId,
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
      { error: 'Failed to submit form' },
      { status: 500 }
    );
  }
} 