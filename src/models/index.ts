// Central model registration to prevent MissingSchemaError
// Import all models in dependency order to ensure proper registration
// Models with references should be imported after the models they reference

import './User';
import './Organization';
import './Lesson';
import './Course';
import './Quiz';
import './Blog';
import './Enrollment';
import './Favorite';
import './QuizAttempt';
import './AppSettings';

// Re-export models for convenience
export { default as User } from './User';
export { default as Organization } from './Organization';
export { default as Lesson } from './Lesson';
export { default as Course } from './Course';
export { default as Quiz } from './Quiz';
export { default as Blog } from './Blog';
export { default as Enrollment } from './Enrollment';
export { default as Favorite } from './Favorite';
export { default as QuizAttempt } from './QuizAttempt';
export { default as AppSettings } from './AppSettings';
