// src/scripts/validateEnrollmentIndex.ts
/**
 * Validation script to ensure compound unique index is working
 * Verifies only one enrollment exists per (student + course)
 */

import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';

async function validateEnrollmentIndex() {
  try {
    console.log('🔍 Validating enrollment compound unique index...');
    
    await dbConnect();
    
    // Step 1: Check if compound unique index exists
    const enrollmentIndexes = await Enrollment.collection.getIndexes();
    const compoundIndexExists = Object.keys(enrollmentIndexes).some(key => 
      key === 'student_1_course_1' || key === 'student_1_course_1_-1'
    );
    
    if (!compoundIndexExists) {
      console.log('❌ Compound unique index not found');
      console.log('Available indexes:', Object.keys(enrollmentIndexes));
      return false;
    }
    
    console.log('✅ Compound unique index found');
    
    // Step 2: Check for any existing duplicates
    const pipeline = [
      {
        $group: {
          _id: { student: '$student', course: '$course' },
          count: { $sum: 1 },
          enrollments: { $push: { _id: '$_id', enrolledAt: '$enrolledAt' } }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ];
    
    const duplicates = await Enrollment.aggregate(pipeline);
    
    if (duplicates.length > 0) {
      console.log(`❌ Found ${duplicates.length} duplicate enrollment groups`);
      duplicates.forEach((dup, index) => {
        console.log(`   ${index + 1}. Student ${dup._id.student} - Course ${dup._id.course}: ${dup.count} enrollments`);
      });
      return false;
    }
    
    console.log('✅ No duplicate enrollments found');
    
    // Step 3: Test the index by attempting to create a duplicate
    console.log('🧪 Testing compound unique index...');
    
    // Get a sample enrollment for testing
    const sampleEnrollment = await Enrollment.findOne();
    
    if (!sampleEnrollment) {
      console.log('⚠️  No enrollments found to test index');
      return true;
    }
    
    const { student, course } = sampleEnrollment;
    
    // Try to create a duplicate enrollment
    const duplicateEnrollment = new Enrollment({
      student,
      course,
      status: 'active',
      progress: 0,
    });
    
    try {
      await duplicateEnrollment.save();
      console.log('❌ FAILED: Duplicate enrollment was created - index not working');
      
      // Clean up the test duplicate
      await Enrollment.deleteOne({ _id: duplicateEnrollment._id });
      return false;
    } catch (error: unknown) {
      const mongoError = error as { code?: number; message?: string };
      if (mongoError.code === 11000) {
        console.log('✅ Compound unique index is working - duplicate prevented');
        return true;
      } else {
        console.log('❌ Unexpected error during duplicate test:', mongoError.message || 'Unknown error');
        return false;
      }
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  }
}

// Run the validation if this file is executed directly
if (require.main === module) {
  validateEnrollmentIndex()
    .then((success) => {
      if (success) {
        console.log('🎉 Enrollment index validation passed');
        process.exit(0);
      } else {
        console.log('💥 Enrollment index validation failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Validation failed:', error);
      process.exit(1);
    });
}

export default validateEnrollmentIndex;
