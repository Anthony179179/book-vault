import { Book, Author, getAxiosErrorMessages, genres, genre } from "./utils"
import { useState, useEffect } from "react"
import axios from "axios";

import { DataGrid, GridColDef, GridRowId, GridRowsProp, useGridApiRef } from '@mui/x-data-grid';
import { Button, IconButton } from "@mui/material";
import { GridDeleteIcon } from "@mui/x-data-grid";


axios.defaults.baseURL = "http://localhost:3000";

interface BookRow {
    id: string,
    title: string,
    author: string,
    pub_year: string,
    genre: genre
}


function BookList() {

    let [books, setBooks] = useState<GridRowsProp<BookRow>>([]);
    let [authors, setAuthors] = useState<Author[]>([]);
    let [messages, setMessages] = useState<string[]>([]);

    let [rowEdits, setRowEdits] = useState<number>(0);

    const bookColumns: GridColDef[] = [
        { field: 'id', headerName: "id", width: 30},
        { field: 'title', headerName: 'Title', width: 200, editable: true },
        { field: 'author', headerName: 'Author', width: 150 },
        { field: 'pub_year', headerName: 'Publication Year', width: 150, editable: true },
        { field: 'genre', headerName: 'Genre', width: 90, editable: true },
        { field: ' ', headerName: ' ', type: "actions", width: 90, editable: true, getActions: ({ id }) => {return [<IconButton onClick={deleteBookRow(id)} aria-label="delete" size="small"><GridDeleteIcon fontSize="inherit" /></IconButton>]} },
      ];
    
    const authorColumns: GridColDef[] = [
        { field: 'id', headerName: "id", width: 30},
        { field: 'name', headerName: 'Name', width: 150, editable: true },
        { field: 'bio', headerName: 'Bio', width: 300, editable: true },
        { field: ' ', headerName: ' ', type: "actions", width: 90, editable: true, getActions: ({ id }) => {return [<IconButton onClick={deleteAuthorRow(id)} aria-label="delete" size="small"><GridDeleteIcon fontSize="inherit" /></IconButton>]} },
      ];
    
    const deleteBookRow = (id: GridRowId) => async () => {
        try {
            setMessages([]);
            await axios.delete(`/api/books/${id}`);
            setBooks(books.filter((book) => book.id !== id));
        } catch (error) {
            setMessages(getAxiosErrorMessages(error));
        }
    }

    const deleteAuthorRow = (id: GridRowId) => async () => {
        try {
            setMessages([]);
            await axios.delete(`/api/authors/${id}`);
            setAuthors(authors.filter((author) => author.id !== id));
        } catch (error) {
            if (getAxiosErrorMessages(error)[0] == "Request failed with status code 403")
                setMessages(["Oops! You need to delete all the books associated to that author first."]);
        }
    }

    useEffect(() => {
        (async () => {
            try {
                let booksResponse = await axios.get<Book[]>("/api/books");
                let authorsResponse = await axios.get<Author[]>("/api/authors");
                let tempBooks: Book[] = booksResponse.data.sort((a, b) => a.title.localeCompare(b.title))
                let newBooks: any = tempBooks.map((book) => {
                    let author: string[] = authorsResponse.data.filter((author) => author.id == book.author_id).map((author) => author.name);
                    return { id: book.id, title: book.title, author: author[0], pub_year: book.pub_year, genre: book.genre }
                })
                setBooks(newBooks);
                setAuthors(authorsResponse.data);
                setMessages([]);
            } catch (error) {
                setMessages(getAxiosErrorMessages(error));
            }           
        })();
    }, [rowEdits]);

    async function handleBookRowEdit(updatedRow: BookRow, originalRow: BookRow) {
        let authorID: number = authors.filter((author) => author.name == updatedRow.author).map((author) => author.id)[0];
        let newBook: Book = { "id": parseInt(updatedRow.id), "author_id": authorID, "title": updatedRow.title, "pub_year": parseInt(updatedRow.pub_year), "genre": updatedRow.genre };
        try {
            await axios.put(`/api/books/${newBook.id}`, newBook);
            return updatedRow;
        } catch (error) {
            setMessages(getAxiosErrorMessages(error));
            return originalRow;
        }
    }

    async function handleAuthorRowEdit(updatedRow: Author, originalRow: Author) {
        try {
            await axios.put(`/api/authors/${updatedRow.id}`, updatedRow);
            setRowEdits(rowEdits + 1);
            return updatedRow;
        } catch (error) {
            setMessages(["Invalid Row Edit!"]);
            return originalRow;
        }
    }

    return (
        <>
            <div className="tables-container">
                <div style={{ height: 500 }}>
                    <h2>Books:</h2>
                    <DataGrid rows={books} columns={bookColumns} autoHeight={false} editMode={"row"} processRowUpdate={async (updatedRow, originalRow) => {
                        return handleBookRowEdit(updatedRow, originalRow);
                    }} onProcessRowUpdateError={(error) => alert(error)}/>
                </div>
                <div style={{ height: 500 }}>
                    <h2>Authors:</h2>
                    <DataGrid rows={authors} columns={authorColumns} autoHeight={false} editMode={"row"} processRowUpdate={async (updatedRow, originalRow) => {
                        return handleAuthorRowEdit(updatedRow, originalRow);
                    }} onProcessRowUpdateError={(error) => alert(error)}/>
                </div>
            </div>
            <div className="error-message">
                {messages.map((message, i) => (
                    <div key={i}>{message}</div>
                ))}
            </div>
        </>
    )
}

export default BookList;