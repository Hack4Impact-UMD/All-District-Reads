import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import {
  getDocs,
  collection,
  doc,
  getDoc,
  deleteDoc, 
  query,
  where // Import query and where functions
} from "firebase/firestore";
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell , { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import styles from "./ReadingSchedule.module.css";
import { useParams, useNavigate } from "react-router-dom";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "grey",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

interface ReadingAssignment {
  id: string;
  title: string;
  bookId: string;
  bookTitle?: string;
  readingPeriod: string;
  dueDate: string;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

export default function ReadingScheduleBottom() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [rows, setRows] = React.useState<ReadingAssignment[]>([]);
  const [filteredRows, setFilteredRows] = React.useState<ReadingAssignment[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<ReadingAssignment | null>(null);

  const [filterBookTitle, setFilterBookTitle] = useState("");
  const [filterDueDate, setFilterDueDate] = useState("");
  const [filterReadingPeriod, setFilterReadingPeriod] = useState("");
  const { schoolDistrictId } = useParams();
  const navigate = useNavigate(); 

  React.useEffect(() => {
    const fetchData = async () => {
      if (schoolDistrictId) {
        // Create a query to filter documents by schoolDistrictId
        const q = query(collection(db, "readingSchedules"), where("schoolDistrictId", "==", schoolDistrictId));
        const querySnapshot = await getDocs(q);
        const rowsData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
        const bookId = docSnapshot.data().bookId;
        const bookDocRef = doc(db, "books", bookId); 
        const bookDoc = await getDoc(bookDocRef);

        const bookData = bookDoc.data() as { title: string } | undefined;
        const bookTitle = bookData ? bookData.title : "Unknown Title";

        return {
          id: docSnapshot.id,
          title: docSnapshot.data().title,
          bookId,
          bookTitle,
          readingPeriod: docSnapshot.data().readingPeriod,
          dueDate: docSnapshot.data().dueDate,
        };
        }));
        setRows(rowsData);
      }
    };
  
    fetchData();
  }, [schoolDistrictId]);

  // Apply filters
  useEffect(() => {
    let filteredData = rows;

    if (filterBookTitle) {
      filteredData = filteredData.filter(row =>
        row.bookTitle?.toLowerCase().includes(filterBookTitle.toLowerCase())
      );
    }

    if (filterDueDate) {
      filteredData = filteredData.filter(row =>
        row.dueDate.includes(filterDueDate)
      );
    }

    if (filterReadingPeriod) {
      filteredData = filteredData.filter(row =>
        row.readingPeriod.toLowerCase().includes(filterReadingPeriod.toLowerCase())
      );
    }

    setFilteredRows(filteredData);
  }, [rows, filterBookTitle, filterDueDate, filterReadingPeriod]);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0;

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (assignment: ReadingAssignment) => {
    setAssignmentToDelete(assignment);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (assignmentToDelete) {
      await deleteDoc(doc(db, "readingSchedules", assignmentToDelete.id));
      setRows((prevRows) => prevRows.filter((row) => row.id !== assignmentToDelete.id));
      setAssignmentToDelete(null);
    }
    setOpenDialog(false);
  };

  const handleCancelDelete = () => {
    setAssignmentToDelete(null);
    setOpenDialog(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "readingSchedules", id));
      setRows(prevRows => prevRows.filter(row => row.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleEdit = (id: string) => {
    if (schoolDistrictId) {
      navigate(`/schedule/schoolDistrict/${schoolDistrictId}/assignment/${id}`);
    }
  };

  return (
    <Box>
      <div className={styles.pageTop}>
        <h1 className={styles.pageTitle}>Reading Schedule</h1>
        {schoolDistrictId && (
          <p className={styles.schoolDistrictId}>School District ID: {schoolDistrictId}</p>
        )}
        <Button
          variant="outlined"
          size="medium"
          sx={{
            backgroundColor: 'white',
            color: '#0071ba', 
            borderColor: '#0071ba', 
            '&:hover': {
              backgroundColor: '#f5f5f5', 
              borderColor: '#0071ba', 
            },
          }}
          onClick={() => navigate(`/schedule/${schoolDistrictId}/add`)}
        >
          Add New Assignment
        </Button>
      </div>
      
      <h3 className="filters-title">Filters</h3>
      <Box sx={{ display: 'flex', justifyContent: 'left', marginBottom: 1, marginTop: 1}}>
        <TextField
          label="Filter by Book"
          variant="outlined"
          value={filterBookTitle}
          onChange={(e) => setFilterBookTitle(e.target.value)}
          style={{ marginRight: '0.4%', marginLeft: '1%' }}
            size="small" 
            InputProps={{
              sx: {
                height: '30px', 
              },
            }}
            InputLabelProps={{
              sx: {
                fontSize: '0.8rem', 
              },
            }}
        />
        <TextField
          label="Filter by Due Date"
          variant="outlined"
          value={filterDueDate}
          onChange={(e) => setFilterDueDate(e.target.value)}
          style={{ marginRight: '0.4%'}}
            size="small" 
            InputProps={{
              sx: {
                height: '30px', 
              },
            }}
            InputLabelProps={{
              sx: {
                fontSize: '0.8rem', 
              },
            }}
        />
        <TextField
          label="Filter by Reading Period"
          variant="outlined"
          value={filterReadingPeriod}
          onChange={(e) => setFilterReadingPeriod(e.target.value)}
          style={{ marginRight: '0.4%'}}
            size="small" 
            InputProps={{
              sx: {
                height: '30px', 
              },
            }}
            InputLabelProps={{
              sx: {
                fontSize: '0.8rem', 
              },
            }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Assignment Title</StyledTableCell>
              <StyledTableCell align="right">Book</StyledTableCell>
              <StyledTableCell align="right">Reading Period</StyledTableCell>
              <StyledTableCell align="right">Due Date</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : filteredRows
            ).map((row) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row" className={styles.assignmentTitleCell}>
                  <Box className={styles.assignmentTitleBox}>
                    {row.title}
                    <Box className={styles.iconContainer}>
                      <IconButton size="small" onClick={() => handleEdit(row.id)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() =>  handleDeleteClick(row)}>
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell style={{ width: 160 }} align="right">
                  {row.bookTitle}
                </TableCell>
                <TableCell style={{ width: 160 }} align="right">
                  {row.readingPeriod}
                </TableCell>
                <TableCell style={{ width: 160 }} align="right">
                  {row.dueDate}
                </TableCell>
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={3}
                count={filteredRows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                slotProps={{
                  select: {
                    inputProps: {
                      'aria-label': 'rows per page',
                    },
                    native: true,
                  },
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <Dialog
        open={openDialog}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete this reading assignment?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deleting this assignment will remove it permanently and cannot be undone. Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
