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

//parallels the database, honestly don't need to have lol
type ChapterQuestions = {
  chapterId: string;
  chapterNumber: number;
  questions: string[];
  answers: string[];
};

type Book = {
  id: string;
  title: string;
  description?: string;
  chapters?: ChapterQuestions[];
  imageUrl?: string;
};

const Library: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const bookCollection = collection(db, "books");
  const [view, setView] = useState<"grid" | "list" | "add">("grid");
  const placeholderBook: Book = {
    id: "",
    title: "",
    description: "",
    chapters: [],
    imageUrl: "",
  };

  //load the books
  useEffect(() => {
    const fetchBooks = async () => {
      const querySnapshot = await getDocs(bookCollection);
      const booksWithChapters: Book[] = [];

      for (const doc of querySnapshot.docs) {
        const bookData: Book = doc.data() as Book;
        bookData.id = doc.id; // Make sure to set the book id from the document

        // Now fetch chapters for this book
        const chaptersRef = collection(db, "books", doc.id, "Chapters");
        const chaptersSnapshot = await getDocs(chaptersRef);
        const chapterMap: { [key: number]: ChapterQuestions } = {};

        chaptersSnapshot.forEach((chapterDoc) => {
          const chapterData = chapterDoc.data();
          const chapterNumber = chapterData.chapterNumber;

          // Initialize the chapter in the map if it doesn't exist
          if (!chapterMap[chapterNumber]) {
            chapterMap[chapterNumber] = {
              chapterId: chapterDoc.id, // Assuming the chapter document id is what you mean by chapterData.id
              chapterNumber: chapterNumber,
              questions: [],
              answers: [],
            };
          }

          // Push the question and answer into the chapter
          if (Array.isArray(chapterData.questions)) {
            chapterMap[chapterNumber].questions.push(...chapterData.questions);
          }
          if (Array.isArray(chapterData.answers)) {
            chapterMap[chapterNumber].answers.push(...chapterData.answers);
          }
        });

        // Convert the map into an array of ChapterQuestions
        bookData.chapters = Object.values(chapterMap);
        booksWithChapters.push(bookData);
        // console.log(bookData);
      }

      // Set the state with all books including their chapters
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
            {/* Additional details can be added here */}
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
    const tempId = `temp-${Date.now()}`; // Generate a temporary unique ID
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
        questions: ["Question"],
        answers: ["Answer"],
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
      // Existing book: Update logic here
    } else {
      // New book: Save logic here
      const docRef = await addDoc(collection(db, "books"), {
        title: bookData.title,
        description: bookData.description,
        // Other properties...
      });
      savedBookId = docRef.id; // Update with the permanent ID from Firestore
    }

    // Update the local state with the new or updated book
    // For a new book, replace the temporary ID with the permanent Firestore ID
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === bookData.id ? { ...bookData, id: savedBookId } : book,
      ),
    );

    // Additional logic to handle the state update...
  };

  const handleCloseModal = () => {
    setActiveBook(null);
  };

  //delete in database and array
  const deleteBook = async (id: string) => {
    if (!id) {
      console.error("Book ID is invalid.");
      return;
    }

    // Now we're sure the ID is valid, proceed with deletion
    const chaptersRef = collection(db, `books/${id}/Chapters`);

    // Fetch all documents in the "Chapters" subcollection
    const querySnapshot = await getDocs(chaptersRef);
    const batch = writeBatch(db);

    // Add each chapter document to the batch delete
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    await deleteDoc(doc(db, "books", id));
    setBooks(books.filter((book) => book.id !== id));
  };

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="library-container">
      <div className="library-header">
        <h1>Library of Books</h1>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search Library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />
          {/* View mode buttons */}
        </div>
      </div>

      <div className="view-buttons">
        <h2>Recently Added</h2>
        <div className="buttons">
          <button
            className="view-button"
            onClick={() => setView("grid")}
            title="Grid View"
          >
            <i className="fa fa-th-large"></i> {/* Grid View Icon */}
          </button>
          <button
            className="view-button"
            onClick={() => setView("list")}
            title="List View"
          >
            <i className="fa fa-list"></i> {/* List View Icon */}
          </button>
          <button
            className="view-button"
            onClick={addBookToLibrary}
            title="Add Book"
          >
            <i className="fa fa-plus"></i> {/* Add Book Icon */}
          </button>
        </div>
      </div>

      {view === "grid" && (
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <div className="book-card" key={book.id}>
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
                  className="edit-book"
                >
                  <i className="icon">&#x270E;</i>
                </button>
                <button
                  onClick={() => deleteBook(book.id)}
                  className="delete-book"
                >
                  <i className="icon fa fa-trash-o"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "list" && (
        <div className="book-list">
          {filteredBooks.map((book) => (
            <div key={book.id} className="book-list-item">
              <div className="book-details">
                <div className="book-title">{book.title || "No Title"}</div>
                {/* Other details can be added here if needed */}
              </div>
              <div className="book-list-options">
                <button onClick={() => setActiveBook(book)}>Edit</button>
                <button onClick={() => deleteBook(book.id)}>Delete</button>
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
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>
              &times;
            </span>
            <AddBooksForm
              book={activeBook}
              onSave={saveBookData}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
