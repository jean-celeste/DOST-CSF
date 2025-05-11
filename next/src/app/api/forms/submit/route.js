import { NextResponse } from 'next/server';
import pool from '@/lib/db/database';

import { verifyToken } from '@/lib/auth/jwt';

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

      // 1. Find or create client
      let clientId = null;
      
      // Only search for existing client if we have identifiers
      if (formData.personalDetails.email || formData.personalDetails.name || formData.personalDetails.contact) {
        // Build a simple query to find existing client
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
          const clientCheck = await client.query(
            `SELECT client_id FROM client WHERE ${searchConditions.join(' OR ')} LIMIT 1`,
            searchParams
          );
          
          if (clientCheck.rows.length > 0) {
            clientId = clientCheck.rows[0].client_id;
          }
        }
      }
      
      // 2. Update or insert client
      if (clientId) {
        // Update existing client - only update fields that are provided
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
        
        if (formData.personalDetails.clientType) {
          // Get the client type ID first
          const clientTypeResult = await client.query(
            `SELECT client_type_id, client_type_name FROM client_type WHERE client_type_name = $1`,
            [formData.personalDetails.clientType]
          );
          
          if (clientTypeResult.rows.length > 0) {
            const clientTypeId = clientTypeResult.rows[0].client_type_id;
            const clientTypeName = clientTypeResult.rows[0].client_type_name;
            
            updateFields.push('client_type_id = $' + (updateParams.length + 1));
            updateParams.push(clientTypeId);
            
            // If client type is Internal, explicitly set external_type_id to NULL
            if (clientTypeName.toLowerCase() === 'internal') {
              updateFields.push('external_type_id = NULL');
            }
          }
        }
        
        if (formData.personalDetails.externalType) {
          updateFields.push('external_type_id = (SELECT external_type_id FROM external_client_type WHERE external_type_name = $' + (updateParams.length + 1) + ')');
          updateParams.push(formData.personalDetails.externalType);
        }
        
        // Always update the timestamp
        updateFields.push('last_updated = NOW()');
        
        if (updateFields.length > 0) {
          updateParams.push(clientId);
          
          await client.query(
            `UPDATE client SET ${updateFields.join(', ')} WHERE client_id = $${updateParams.length}`,
            updateParams
          );
        }
      } else {
        // Insert new client
        const insertResult = await client.query(
          `INSERT INTO client (
            email, phone, sex, name, age,
            client_type_id, external_type_id,
            last_updated
          )
          VALUES (
            $1, $2, $3, $4, $5,
            (SELECT client_type_id FROM client_type WHERE client_type_name = $6),
            (SELECT external_type_id FROM external_client_type WHERE external_type_name = $7),
            NOW()
          )
          RETURNING client_id`,
          [
            formData.personalDetails.email || null,
            formData.personalDetails.contact || null,
            formData.personalDetails.sex || null,
            formData.personalDetails.name || null,
            formData.personalDetails.age || null,
            formData.personalDetails.clientType || 'Individual',
            formData.personalDetails.externalType || 'External'
          ]
        );
        
        clientId = insertResult.rows[0].client_id;
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
          client_id,
          submitted_at,
          answers
        ) VALUES ($1, $2, $3, NOW(), $4)
        RETURNING response_id`,
        [
          formData.formId,
          formData.personalDetails.service_id,
          clientId,
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