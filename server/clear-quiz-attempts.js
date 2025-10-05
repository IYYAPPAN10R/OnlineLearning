// Script to clear all quiz attempts for testing
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/online-learning', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function clearQuizAttempts() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Define QuizAttempt schema (simple version)
    const QuizAttempt = mongoose.model('QuizAttempt', new mongoose.Schema({}, { strict: false }));
    
    // Count existing attempts
    const count = await QuizAttempt.countDocuments();
    console.log(`Found ${count} existing quiz attempts`);
    
    if (count > 0) {
      // Delete all quiz attempts
      const result = await QuizAttempt.deleteMany({});
      console.log(`Deleted ${result.deletedCount} quiz attempts`);
    } else {
      console.log('No quiz attempts to delete');
    }
    
    console.log('✅ Quiz attempts cleared successfully!');
    console.log('You can now try taking the quiz again.');
    
  } catch (error) {
    console.error('❌ Error clearing quiz attempts:', error);
  } finally {
    mongoose.connection.close();
  }
}

clearQuizAttempts();
