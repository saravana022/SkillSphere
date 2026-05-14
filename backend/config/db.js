// Mock DB for migration
module.exports = {
    query: async () => {
        console.log('SQL Query called but not supported in MongoDB mode.');
        return [[]];
    }
};
