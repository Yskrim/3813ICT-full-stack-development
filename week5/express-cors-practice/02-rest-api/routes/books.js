module.exports = function (app) {
    let books = [
        { id: 1, title: "Dune", author: "Frank Herbert", year: 1965 },
        { id: 2, title: "Neuromancer", author: "William Gibson", year: 1984 },
    ];

    // TODO: GET /api/books -> return all books
    app.get("/api/books", (req, res) => {
        if (books) res.status(200).json({ books });
        else res.status(404).json({ error: "Books not found" });
    });

    // TODO: GET /api/books/:id -> return one book or 404
    app.get("/api/books/:id", (req, res) => {
        const bookId = Number(req.params.id);
        const book = books.find((b) => b.id === bookId);

        if (book) res.status(200).json({ status: "OK", book });
        else res.status(404).json({ error: "Book not found" });
    });

    // TODO: POST /api/books -> validate title, create book, 201
    app.post("/api/books/", (req, res) => {
        const { title, author, year } = req.body;
        if (title && author && year) {
            if (!books.find((b) => b.title === title)) {
                books.push({ id: books.length + 1, title, author, year });
                res.status(201).json({ status: "ok", books });
            } 
            else res.status(400).json({ error: "Book already exists" });
        } 
        else if (!title) res.status(400).json({ error: "title is required" });
        else if (!author) res.status(400).json({ error: "author is required" });
        else if (!year) res.status(400).json({ error: "year is required" });
        else res.status(400).json({ error: "Bad request" });
    });

    // TODO: PUT /api/books/:id -> update book or 404
    app.put("/api/books/:id", (req, res) => {
        const id = Number(req.params.id);
        const { title, author, year } = req.body;
        const book = books.find((b) => b.id === id);

        if (book) {
            if (title && author && year) {
                const index = books.indexOf(book);
                books[index] = { ...books[index], title, author, year };
                res.status(200).json({ status: "OK", book: books[index] });
            } 
            else if (!title) res.status(400).json({ error: "title is required" });
            else if (!author) res.status(400).json({ error: "author is required" });
            else if (!year) res.status(400).json({ error: "year is required" });
        } 
        else res.status(404).json({ error: "Book not found" });
    });

    // TODO: DELETE /api/books/:id -> remove book, 204, or 404
    app.delete("/api/books/:id", (req, res) => {
        const id = Number(req.params.id);
        const book = books.find((b) => b.id === id);
        const index = books.indexOf(book);
        if (book) {
            books.splice(index, 1);
            res.status(204).json({ status: "deleted", books });
        } 
        else res.status(404).json({ error: "Book not found" });
    });

    app.use((req, res, next) => {
        res.status(404).json({ error: "Not found" });
    });
};
