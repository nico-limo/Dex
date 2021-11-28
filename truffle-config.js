const path = require("path");
module.exports = {
    contracts_build_directory: path.join(__dirname, "client/src/contracts"),
    // Configure your compilers
    compilers: {
        solc: {
            version: "0.8.9",
        },
    },
};
