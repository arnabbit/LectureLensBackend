const { detectCategory } = require('./detector');
const { getCategory } = require('./registry');

async function routeCourse(courseId, courseName) {
  const categoryId = await detectCategory(courseId, courseName);
  const categoryModule = getCategory(categoryId);

  if (categoryModule) return categoryModule;

  console.warn('[categoryRouter] All category lookups failed');
  return undefined;
}

function routeByCategoryId(categoryId) {
  return getCategory(categoryId) || getCategory('generic');
}

module.exports = { routeCourse, routeByCategoryId };
