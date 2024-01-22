CREATE TABLE books (
    id INTEGER PRIMARY KEY, -- can change to be integer if you want
    author_id INTEGER,
    title TEXT,
    pub_year INTEGER,
    genre TEXT,
    FOREIGN KEY(author_id) REFERENCES authors(id)
);

CREATE TABLE authors (
    id INTEGER PRIMARY KEY, -- can change to be integer if you want
    name TEXT,
    bio TEXT
);

INSERT INTO authors(id, name, bio) VALUES(1, 'Rebecca Wilson', 'My favourite');
INSERT INTO authors(id, name, bio) VALUES(2, 'Laura Gallego', 'A classic');
INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(1, 2, 'Alas de Fuego', '2004', 'fantasy');
INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(2, 2, 'Alas Negras', '2009', 'fantasy');
INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(3, 2, 'Dos Velas Para El Diablo', '2008', 'fiction');
INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(4, 1, 'Best Book Ever', '2035', 'mystery');
INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(5, 1, 'Even Better Book', '2037', 'romance');
INSERT INTO books(id, author_id, title, pub_year, genre) VALUES(6, 1, 'Wow An Even Better Book', '2009', 'fantasy');
