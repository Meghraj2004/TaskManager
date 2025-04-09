// This file is kept for compatibility with existing code,
// but no longer contains actual database configuration since
// we're using Firebase directly for data operations.

// Mock db implementation to prevent errors in code that might import it
export const db = {
  select: () => ({ from: () => ({ where: () => [] })}),
  insert: () => ({ values: () => ({ returning: () => [] })}),
  update: () => ({ set: () => ({ where: () => ({ returning: () => [] })})}),
  delete: () => ({ where: () => ({ rowCount: 0 })}),
};
