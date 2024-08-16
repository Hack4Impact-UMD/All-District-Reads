import React, { useState, useEffect } from "react";
import AddBooksForm from "../../Components/AddBooksForm";
import "./Library.css";
import { db } from "../../config/firebase";
import "@fortawesome/fontawesome-free/css/all.css";
import {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import Paper from "@mui/material/Paper";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import TextField from "@mui/material/TextField";
import GridViewIcon from "@mui/icons-material/GridView";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AddIcon from "@mui/icons-material/Add";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {Book, ChapterQuestions} from "../../types/types";

const Library: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const bookCollection = collection(db, "books");
  const [view, setView] = useState<"grid" | "list" | "add">("grid");
  const [openDialog, setOpenDialog] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const placeholderBook: Book = {
    id: "",
    title: "",
    description: "",
    chapters: [],
    imageUrl: "",
  };

  useEffect(() => {
    const fetchBooks = async () => {
      const querySnapshot = await getDocs(bookCollection);
      const booksWithChapters: Book[] = [];

      for (const doc of querySnapshot.docs) {
        const bookData: Book = doc.data() as Book;
        bookData.id = doc.id;

        const chaptersRef = collection(db, "books", doc.id, "Chapters");
        const chaptersSnapshot = await getDocs(chaptersRef);
        const chapterMap: { [key: number]: ChapterQuestions } = {};

        chaptersSnapshot.forEach((chapterDoc) => {
          const chapterData = chapterDoc.data();
          const chapterNumber = chapterData.chapterNumber;

          if (!chapterMap[chapterNumber]) {
            chapterMap[chapterNumber] = {
              chapterId: chapterDoc.id,
              chapterNumber: chapterNumber,
              questions: [],
              answers: [],
            };
          }

          if (Array.isArray(chapterData.questions)) {
            chapterMap[chapterNumber].questions.push(...chapterData.questions);
          }
          if (Array.isArray(chapterData.answers)) {
            chapterMap[chapterNumber].answers.push(...chapterData.answers);
          }
        });

        bookData.chapters = Object.values(chapterMap);
        booksWithChapters.push(bookData);
      }

      setBooks(booksWithChapters);
    };

    fetchBooks();
  }, []);

  const BookList = ({ books }: { books: Book[] }) => (
    <div className="book-list">
      {books.map((book) => (
        <div key={book.id} className="book-list-item">
          <div className="book-list-details">
            <div className="book-title">{book.title || "No Title"}</div>
          </div>
          <div className="book-list-actions">
            <button onClick={() => setActiveBook(book)}>Edit</button>
            <button onClick={() => deleteBook(book.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );

  const handleAddBookClick = () => {
    const tempId = `temp-${Date.now()}`;
    setActiveBook({
      id: tempId,
      title: "",
      description: "",
      chapters: [],
      imageUrl: "",
    });
  };

  const addBookToLibrary = async () => {
    const chId = Date.now().toString();
    const id = Date.now().toString();
    const temp = [
      {
        chapterId: chId,
        chapterNumber: 1,
        questions: [],
        answers: [],
      },
    ];
    const bookRef = doc(db, "books", id);
    const newBook: Book = {
      id: id,
      title: "",
      description: "",
      chapters: temp,
      imageUrl: "",
    };

    await setDoc(bookRef, { title: "", description: "", imageUrl: "" });
    const chapterRef = doc(db, "books", id, "Chapters", chId);
    await setDoc(chapterRef, {
      chapterNumber: 1,
      questions: ["Question"],
      answers: ["Answer"],
    });
    setBooks([newBook, ...books]);
  };

  const saveBookData = async (bookData: Book) => {
    let savedBookId = bookData.id;

    if (!bookData.id.startsWith("temp-")) {
    } else {
      const docRef = await addDoc(collection(db, "books"), {
        title: bookData.title,
        description: bookData.description,
      });
      savedBookId = docRef.id;
    }

    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === bookData.id ? { ...bookData, id: savedBookId } : book
      )
    );
  };

  const handleCloseModal = () => {
    setActiveBook(null);
  };

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (bookToDelete) {
      await deleteBook(bookToDelete.id);
      setBookToDelete(null);
    }
    setOpenDialog(false);
  };

  const handleCancelDelete = () => {
    setBookToDelete(null);
    setOpenDialog(false);
  };

  const deleteBook = async (id: string) => {
    if (!id) {
      console.error("Book ID is invalid.");
      return;
    }

    const chaptersRef = collection(db, `books/${id}/Chapters`);
    const querySnapshot = await getDocs(chaptersRef);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    await deleteDoc(doc(db, "books", id));
    setBooks(books.filter((book) => book.id !== id));
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="library-container">
      <div className="library-header">
        <h1>Library of Books</h1>
        <div className="search-bar-container">
          <TextField
            id="outlined-search"
            label="Search Library"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="standard"
            sx={{
              input: { color: "white" },
              marginBottom: 2.3,
              label: { color: "white" },
              ".MuiInput-underline:before": { borderBottomColor: "white" },
              ".MuiInput-underline:hover:before": { borderBottomColor: "white" },
              ".MuiInput-underline:after": { borderBottomColor: "white" },
            }}
          />
        </div>
      </div>

      <div className="view-buttons">
        <p className="recently-added">Recently Added</p>
        <div className="buttons">
          <button
            className="view-button"
            onClick={() => setView("grid")}
            title="Grid View"
          >
            <GridViewIcon sx={{ fontSize: 17, alignSelf: 'center' }}/>
          </button>
          <button
            className="view-button"
            onClick={() => setView("list")}
            title="List View"
          >
            <FormatListBulletedIcon sx={{ fontSize: 17, alignSelf: 'center'  }}/>
          </button>
          <button
            className="view-button"
            onClick={addBookToLibrary}
            title="Add Book"
          >
            <AddIcon sx={{ fontSize: 17, alignSelf: 'center'  }}/>
          </button>
        </div>
      </div>

      {view === "grid" && (
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <Paper elevation={10} className="book-card" key={book.id}>
              <div className="book-image-container">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="book-image"
                  />
                ) : (
                  <div className="book-placeholder">No Image Available</div>
                )}
              </div>
              <div className="book-title">{book.title || "No Title"}</div>
              <div className="book-card-options">
                <button
                  onClick={() => setActiveBook(book)}
                  title = "Edit"
                  className="edit-delete-button"
                >
                  <EditOutlinedIcon sx={{ fontSize: 20, alignSelf: 'center' }}/>
                </button>
                <button
                  onClick={() => handleDeleteClick(book)}
                  title = "Delete"
                  className="edit-delete-button"
                >
                  <DeleteOutlinedIcon sx={{ fontSize: 20, alignSelf: 'center' }}/>
                </button>
              </div>
            </Paper>
          ))}
        </div>
      )}

      {view === "list" && (
        <div className="book-list">
          {filteredBooks.map((book) => (
            <div key={book.id} className="book-list-item">
              <div className="book-details">
                <div className="book-title">{book.title || "No Title"}</div>
              </div>
              <div className="book-list-options">
                <button onClick={() => setActiveBook(book)} className="edit-delete-list">
                  <EditOutlinedIcon style={{ fontSize: "17px" }} />
                </button>
                <button onClick={() => handleDeleteClick(book)} className="edit-delete-list">
                  <DeleteOutlinedIcon style={{ fontSize: "17px" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "add" && (
        <AddBooksForm
          book={placeholderBook}
          onSave={saveBookData}
          onClose={handleCloseModal}
        />
      )}

      {activeBook && (
        <div className="modal show-modal">
          <span className="close" onClick={handleCloseModal}>
            &times;
          </span>
          <AddBooksForm
            book={activeBook}
            onSave={saveBookData}
            onClose={handleCloseModal}
          />
        </div>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete this book?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deleting this book will remove all associated chapters and cannot be undone. Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Library;
