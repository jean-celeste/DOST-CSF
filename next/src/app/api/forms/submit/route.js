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

      // 1. Find or create customer
      let customerId = null;
      
      // Only search for existing customer if we have identifiers
      if (formData.personalDetails.email || formData.personalDetails.name || formData.personalDetails.contact) {
        // Build a simple query to find existing customer
        const searchConditions = [];
        const searchParams = [];
        
        if (formData.personalDetails.email) {
          searchConditions.push('email = $' + (searchParams.length + 1));
          searchParams.push(formData.personalDetails.email);
        }
        
        if (formData.personalDetails.name) {
          searchConditions.push('name = $' + (searchParams.length + 1));
          searchParams.push(formData.personalDetails.name);
        }
        
        if (formData.personalDetails.contact) {
          searchConditions.push('phone = $' + (searchParams.length + 1));
          searchParams.push(formData.personalDetails.contact);
        }
        
        if (searchConditions.length > 0) {
          const customerCheck = await client.query(
            `SELECT customer_id FROM customer WHERE ${searchConditions.join(' OR ')} LIMIT 1`,
            searchParams
          );
          
          if (customerCheck.rows.length > 0) {
            customerId = customerCheck.rows[0].customer_id;
          }
        }
      }
      
      // 2. Update or insert customer
      if (customerId) {
        // Update existing customer - only update fields that are provided
        const updateFields = [];
        const updateParams = [];
        
        if (formData.personalDetails.email) {
          updateFields.push('email = $' + (updateParams.length + 1));
          updateParams.push(formData.personalDetails.email);
        }
        
        if (formData.personalDetails.contact) {
          updateFields.push('phone = $' + (updateParams.length + 1));
          updateParams.push(formData.personalDetails.contact);
        }
        
        if (formData.personalDetails.sex) {
          updateFields.push('sex = $' + (updateParams.length + 1));
          updateParams.push(formData.personalDetails.sex);
        }
        
        if (formData.personalDetails.name) {
          updateFields.push('name = $' + (updateParams.length + 1));
          updateParams.push(formData.personalDetails.name);
        }
        
        if (formData.personalDetails.age) {
          updateFields.push('age = $' + (updateParams.length + 1));
          updateParams.push(formData.personalDetails.age);
        }
        
        if (formData.personalDetails.customerType) {
          // Get the customer type ID first
          const customerTypeResult = await client.query(
            `SELECT cust_type_id, cust_type_name FROM customer_type WHERE cust_type_name = $1`,
            [formData.personalDetails.customerType]
          );
          
          if (customerTypeResult.rows.length > 0) {
            const customerTypeId = customerTypeResult.rows[0].cust_type_id;
            const customerTypeName = customerTypeResult.rows[0].cust_type_name;
            
            updateFields.push('customer_type_id = $' + (updateParams.length + 1));
            updateParams.push(customerTypeId);
            
            // If customer type is Internal, explicitly set external_type_id to NULL
            if (customerTypeName.toLowerCase() === 'internal') {
              updateFields.push('external_type_id = NULL');
            }
          }
        }
        
        if (formData.personalDetails.externalType) {
          updateFields.push('external_type_id = (SELECT external_type_id FROM external_customer_type WHERE external_type_name = $' + (updateParams.length + 1) + ')');
          updateParams.push(formData.personalDetails.externalType);
        }
        
        // Always update the timestamp
        updateFields.push('last_updated = NOW()');
        
        if (updateFields.length > 0) {
          updateParams.push(customerId);
          
          await client.query(
            `UPDATE customer SET ${updateFields.join(', ')} WHERE customer_id = $${updateParams.length}`,
            updateParams
          );
        }
      } else {
        // Insert new customer
        const insertResult = await client.query(
          `INSERT INTO customer (
            email, phone, sex, name, age,
            customer_type_id, external_type_id,
            last_updated
          )
          VALUES (
            $1, $2, $3, $4, $5,
            (SELECT cust_type_id FROM customer_type WHERE cust_type_name = $6),
            (SELECT external_type_id FROM external_customer_type WHERE external_type_name = $7),
            NOW()
          )
          RETURNING customer_id`,
          [
            formData.personalDetails.email || null,
            formData.personalDetails.contact || null,
            formData.personalDetails.sex || null,
            formData.personalDetails.name || null,
            formData.personalDetails.age || null,
            formData.personalDetails.customerType || 'Individual',
            formData.personalDetails.externalType || 'External'
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
          "1": formData.csmARTACheckmark?.selectedOption,
          ...(formData.csmARTACheckmark?.additionalAnswers || {})
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