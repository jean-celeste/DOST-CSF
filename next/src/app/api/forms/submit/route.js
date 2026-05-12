import { NextResponse } from 'next/server';
import pool from '@/lib/db/database';
import { encrypt, hash } from '@/lib/cryptoUtils';

export async function POST(request) {
  try {
    const formData = await request.json();

    const clientDB = await pool.connect();
    try {
      await clientDB.query('BEGIN');

      let formId = formData.formId;
      const serviceId = formData.serviceId || formData.personalDetails?.service_id || formData.service_id;
      const clientType = formData.clientType || formData.personalDetails?.clientType;

      // Debug logging to help identify the issue
      console.log('Form submission data:', { 
        formId, 
        serviceId, 
        clientType, 
        formDataKeys: Object.keys(formData),
        serviceIdSources: {
          serviceId: formData.serviceId,
          personalDetails_service_id: formData.personalDetails?.service_id,
          service_id: formData.service_id
        }
      });

      // Validate serviceId more comprehensively
      if (serviceId !== undefined && serviceId !== null && serviceId !== '' && !isNaN(Number(serviceId))) {
        // Auto-resolve formId from service if not explicitly provided
        if (!formId) {
          const formResult = await clientDB.query(
            `SELECT f.form_id
             FROM service_form sf
             JOIN forms f ON sf.form_id = f.form_id
             WHERE sf.service_id = $1 AND f.status_id = 1
             ORDER BY sf.form_order ASC
             LIMIT 1`,
            [serviceId]
          );

          if (formResult.rows.length === 0) {
            throw new Error('No active form found for this service');
          }
          formId = formResult.rows[0].form_id;
        } // closes if (!formId)
      } // closes if (serviceId !== ...)

      // Check if service ID was provided but form ID couldn't be resolved
      if (!formId) {
        if (!serviceId) {
          throw new Error(`Service ID is required for form submission. Received: serviceId=${serviceId}, formId=${formId}`);
        } else {
          throw new Error(`Form ID is required or could not be resolved from service. Service ID: ${serviceId}, Form ID: ${formId}`);
        }
      }

      const formCheck = await clientDB.query(
        `SELECT form_id FROM forms WHERE form_id = $1 AND status_id = 1`,
        [formId]
      );

      if (formCheck.rows.length === 0) {
        throw new Error('Invalid form ID or form is not active');
      }

      // Validate answers against question types (for dynamic forms)
      // This ensures type consistency before storage
      const questionResult = await clientDB.query(
        `SELECT question_id, question_type FROM questions WHERE form_id = $1 ORDER BY question_order ASC`,
        [formId]
      );
      const questionMap = {};
      questionResult.rows.forEach(q => {
        questionMap[q.question_id] = q.question_type || 'text';
      });

      // Get client_type_id for storage
      let clientTypeId = null;
      if (clientType) {
        const clientTypeResult = await clientDB.query(
          `SELECT client_type_id FROM client_type WHERE client_type_name = $1`,
          [clientType]
        );
        if (clientTypeResult.rows.length > 0) {
          clientTypeId = clientTypeResult.rows[0].client_type_id;
        }
      }

      const personalDetails = formData.personalDetails || {};
      let clientId = null;

      // Client lookup/creation - only if personal details provided
      if (personalDetails.email || personalDetails.name || personalDetails.contact) {
        // Build a simple query to find existing client
        const searchConditions = [];
        const searchParams = [];

        if (personalDetails.email) {
          searchConditions.push('email_hash = $' + (searchParams.length + 1));
          searchParams.push(hash(personalDetails.email));
        }

        if (personalDetails.name) {
          searchConditions.push('name_hash = $' + (searchParams.length + 1));
          searchParams.push(hash(personalDetails.name));
        }

        if (personalDetails.contact) {
          searchConditions.push('phone_hash = $' + (searchParams.length + 1));
          searchParams.push(hash(personalDetails.contact));
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

        // 2. Update or insert client
        if (clientId) {
          // Update existing client - only update fields that are provided
          const updateFields = [];
          const updateParams = [];
          let paramIndex = 1;

          if (personalDetails.email) {
            updateFields.push(`email = $${paramIndex}`);
            updateParams.push(encrypt(personalDetails.email));
            paramIndex++;
            updateFields.push(`email_hash = $${paramIndex}`);
            updateParams.push(hash(personalDetails.email));
            paramIndex++;
          }

          if (personalDetails.contact) {
            updateFields.push(`phone = $${paramIndex}`);
            updateParams.push(encrypt(personalDetails.contact));
            paramIndex++;
            updateFields.push(`phone_hash = $${paramIndex}`);
            updateParams.push(hash(personalDetails.contact));
            paramIndex++;
          }

          if (personalDetails.sex) {
            updateFields.push(`sex = $${paramIndex++}`);
            updateParams.push(personalDetails.sex);
          }

          if (personalDetails.name) {
            updateFields.push(`name = $${paramIndex}`);
            updateParams.push(encrypt(personalDetails.name));
            paramIndex++;
            updateFields.push(`name_hash = $${paramIndex}`);
            updateParams.push(hash(personalDetails.name));
            paramIndex++;
          }

          if (personalDetails.age) {
            updateFields.push(`age = $${paramIndex++}`);
            updateParams.push(personalDetails.age);
          }

          if (clientTypeId) {
            updateFields.push(`client_type_id = $${paramIndex++}`);
            updateParams.push(clientTypeId);
          }

          updateFields.push('last_updated = NOW()');

          if (updateParams.length > 0) {
            await clientDB.query(
              `UPDATE client SET ${updateFields.join(', ')} WHERE client_id = $${paramIndex}`,
              [...updateParams, clientId]
            );
          }
        } else {
          // Insert new client
          const encryptedEmail = encrypt(personalDetails.email || null);
          const encryptedContact = encrypt(personalDetails.contact || null);
          const encryptedName = encrypt(personalDetails.name || null);
          const emailHash = hash(personalDetails.email || null);
          const phoneHash = hash(personalDetails.contact || null);
          const nameHash = hash(personalDetails.name || null);

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
              personalDetails.sex || null,
              encryptedName,
              nameHash,
              personalDetails.age || null,
              clientTypeId
            ]
          );

          clientId = insertResult.rows[0].client_id;
        }
      }

      // Build answers object - support both dynamic (question_id-keyed) and legacy formats
      let answers = {};

      if (formData.answers) {
        answers = { ...formData.answers };

        // Extract and merge suggestions if present in answers
        if (formData.answers.suggestions) {
          answers.suggestion = {
            generalComments: formData.answers.suggestions.generalComments || formData.answers.suggestions.general_comments,
            reasonForLowScore: formData.answers.suggestions.reasonForLowScore || formData.answers.suggestions.reason_for_low_score
          };
          delete answers.suggestions;
        }
      }

      // Merge legacy form data for backward compatibility
      if (formData.csmARTACheckmark) {
        answers.csmARTACheckmark = formData.csmARTACheckmark;
      }
      if (formData.csmARTARatings) {
        answers.csmARTARatings = formData.csmARTARatings;
      }
      if (formData.qmsCheckmark) {
        answers.qmsCheckmark = formData.qmsCheckmark;
      }
      if (formData.qmsRatings) {
        answers.qmsRatings = formData.qmsRatings;
      }
      if (formData.suggestion) {
        answers.suggestion = formData.suggestion;
      }

      // Validate dynamic form answers against question types
      // Only validate questions that are in the questionMap (dynamic forms)
      // Legacy forms skip this validation
      if (Object.keys(questionMap).length > 0) {
        for (const [questionId, answer] of Object.entries(answers)) {
          // Skip non-question fields (legacy keys, suggestions, etc.)
          if (!questionMap.hasOwnProperty(questionId)) continue;

          const questionType = questionMap[questionId];

          // Validate based on question type
          if (questionType === 'rating' || questionType === 'radio') {
            // Rating and radio should be numeric or valid string values
            if (answer === null || answer === undefined || answer === '') {
              // Rating questions are required - but already validated on frontend
              // We allow empty here for now to prevent submission errors
            } else if (typeof answer !== 'number' && typeof answer !== 'string') {
              throw new Error(`Invalid answer for question ${questionId}: rating/radio must be a number or string`);
            }
          } else if (questionType === 'checkmark') {
            // Checkmark should be boolean or 'yes'/'no' string
            if (answer !== null && answer !== undefined && answer !== '') {
              if (typeof answer !== 'boolean' && !['yes', 'no', 'na', 'n/a'].includes(String(answer).toLowerCase())) {
                throw new Error(`Invalid answer for question ${questionId}: checkmark must be yes/no/n/a`);
              }
            }
          } else if (questionType === 'text' || questionType === 'textarea') {
            // Text/textarea should be string
            if (answer !== null && answer !== undefined && answer !== '') {
              if (typeof answer !== 'string') {
                throw new Error(`Invalid answer for question ${questionId}: text/textarea must be a string`);
              }
              // Check max length for text fields (500 chars)
              if (answer.length > 500) {
                throw new Error(`Answer for question ${questionId} exceeds 500 character limit`);
              }
            }
          }
        }
      }

      // Insert response
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
          formId,
          serviceId,
          clientId,
          JSON.stringify(answers)
        ]
      );

      await clientDB.query('COMMIT');

      return NextResponse.json({
        success: true,
        responseId: responseResult.rows[0].response_id
      });

    } catch (innerError) {
      await clientDB.query('ROLLBACK');
      throw innerError;
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