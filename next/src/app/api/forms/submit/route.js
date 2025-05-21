import { NextResponse } from 'next/server';
import pool from '@/lib/db/database';
import { encrypt, hash } from '@/lib/cryptoUtils'; // Import the encrypt and hash functions

// import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Start a transaction
    const clientDB = await pool.connect(); // Renamed to clientDB to avoid conflict with 'client' table alias
    try {
      await clientDB.query('BEGIN');

      // Validate form_id exists
      const formCheck = await clientDB.query(
        `SELECT form_id FROM forms WHERE form_id = $1 AND status_id = 1`, // Check if form is active
        [formData.formId]
      );

      if (formCheck.rows.length === 0) {
        throw new Error('Invalid form ID or form is not active');
      }

      // 1. Find or create client
      let clientId = null;
      
      if (formData.personalDetails.email || formData.personalDetails.name || formData.personalDetails.contact) {
        // Build a simple query to find existing client
        const searchConditions = [];
        const searchParams = [];
        
        if (formData.personalDetails.email) {
          searchConditions.push('email_hash = $' + (searchParams.length + 1));
          searchParams.push(hash(formData.personalDetails.email)); // Search with hash value
        }
        
        if (formData.personalDetails.name) {
          searchConditions.push('name_hash = $' + (searchParams.length + 1));
          searchParams.push(hash(formData.personalDetails.name)); // Search with hash value
        }
        
        if (formData.personalDetails.contact) {
          searchConditions.push('phone_hash = $' + (searchParams.length + 1));
          searchParams.push(hash(formData.personalDetails.contact)); // Search with hash value
        }
        
        if (searchConditions.length > 0) {
          const clientCheck = await clientDB.query(
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
        let paramIndex = 1;

        if (formData.personalDetails.email) {
          updateFields.push(`email = $${paramIndex}`);
          updateParams.push(encrypt(formData.personalDetails.email));
          paramIndex++;
          updateFields.push(`email_hash = $${paramIndex}`);
          updateParams.push(hash(formData.personalDetails.email));
          paramIndex++;
        }
        
        if (formData.personalDetails.contact) {
          updateFields.push(`phone = $${paramIndex}`);
          updateParams.push(encrypt(formData.personalDetails.contact));
          paramIndex++;
          updateFields.push(`phone_hash = $${paramIndex}`);
          updateParams.push(hash(formData.personalDetails.contact));
          paramIndex++;
        }
        
        if (formData.personalDetails.sex) {
          updateFields.push(`sex = $${paramIndex++}`);
          updateParams.push(formData.personalDetails.sex);
        }
        
        if (formData.personalDetails.name) {
          updateFields.push(`name = $${paramIndex}`);
          updateParams.push(encrypt(formData.personalDetails.name));
          paramIndex++;
          updateFields.push(`name_hash = $${paramIndex}`);
          updateParams.push(hash(formData.personalDetails.name));
          paramIndex++;
        }
        
        if (formData.personalDetails.age) {
          updateFields.push(`age = $${paramIndex++}`);
          updateParams.push(formData.personalDetails.age);
        }
        
        if (formData.personalDetails.clientType) {
          const clientTypeResult = await clientDB.query(
            `SELECT client_type_id FROM client_type WHERE client_type_name = $1`,
            [formData.personalDetails.clientType]
          );
          if (clientTypeResult.rows.length > 0) {
            const clientTypeId = clientTypeResult.rows[0].client_type_id;
            updateFields.push(`client_type_id = $${paramIndex++}`);
            updateParams.push(clientTypeId);
          }
        }
        
        updateFields.push('last_updated = NOW()');
        
        if (updateParams.length > 0) { // Check if there are any actual fields to update besides timestamp
          updateParams.push(clientId);
          
          await clientDB.query(
            `UPDATE client SET ${updateFields.join(', ')} WHERE client_id = $${paramIndex++}`,
            updateParams
          );
        }
      } else {
        // Insert new client
        const clientTypeResult = await clientDB.query(
          `SELECT client_type_id FROM client_type WHERE client_type_name = $1`,
          [formData.personalDetails.clientType]
        );
        const clientTypeId = clientTypeResult.rows.length > 0 ? clientTypeResult.rows[0].client_type_id : null;
        
        const encryptedEmail = encrypt(formData.personalDetails.email || null);
        const encryptedContact = encrypt(formData.personalDetails.contact || null);
        const encryptedName = encrypt(formData.personalDetails.name || null);
        const emailHash = hash(formData.personalDetails.email || null);
        const phoneHash = hash(formData.personalDetails.contact || null);
        const nameHash = hash(formData.personalDetails.name || null);

        const insertResult = await clientDB.query(
          `INSERT INTO client (
            email, email_hash, phone, phone_hash, sex, name, name_hash, age,
            client_type_id,
            last_updated
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9,
            NOW()
          )
          RETURNING client_id`,
          [
            encryptedEmail,
            emailHash,
            encryptedContact,
            phoneHash,
            formData.personalDetails.sex || null,
            encryptedName,
            nameHash,
            formData.personalDetails.age || null,
            clientTypeId
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
      const responseResult = await clientDB.query(
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

      await clientDB.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        responseId: responseResult.rows[0].response_id 
      });
    } catch (error) {
      await clientDB.query('ROLLBACK');
      throw error;
    } finally {
      clientDB.release();
    }
  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit form' },
      { status: 500 }
    );
  }
}