import express from "express";
import "dotenv/config";
const app = express();
const Port = process.env.PORT || 3001;
app.listen(Port, () => {
    console.log(`Server is Runing on http://localhost:${Port}`);
});
//# sourceMappingURL=index.js.map