

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import './App.css'; 


const Home = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [topActors, setTopActors] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedActor, setSelectedActor] = useState(null);
  const [showMovies, setShowMovies] = useState(false);
  const [showActors, setShowActors] = useState(false);

  const fetchTopMovies = async () => {
    try {
      const response = await axios.get('http://localhost:5000/top_movies');
      setTopMovies(response.data);
    } catch (error) {
      console.error('Error fetching top movies:', error);
    }
  };

  const fetchTopActors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/top_actors');
      setTopActors(response.data);
    } catch (error) {
      console.error('Error fetching top actors:', error);
    }
  };

  const handleMoviesButtonClick = async () => {
    setShowMovies(true);
    setShowActors(false);
    setSelectedMovie(null);
    setSelectedActor(null); // Reset selected actor details
    if (topMovies.length === 0) {
      await fetchTopMovies();
    }
  };

  const handleActorsButtonClick = async () => {
    setShowActors(true);
    setShowMovies(false);
    setSelectedMovie(null);
    setSelectedActor(null); // Reset selected actor details
    if (topActors.length === 0) {
      await fetchTopActors();
    }
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleActorClick = (actor) => {
    setSelectedActor(actor);
  };

  return (
    <div>
      <h1>Home</h1>

      <button onClick={handleMoviesButtonClick}>Show Top 5 Movies</button>
      <button onClick={handleActorsButtonClick}>Show Top 5 Actors</button>

      {showMovies && topMovies.length === 0 ? (
        <p>No movies available</p>
      ) : showMovies ? (
        <div>
          <ul>
            {topMovies.map((movie) => (
              <li key={movie.film_id} onClick={() => handleMovieClick(movie)}>
                {`${movie.title}, Rental Count: ${movie.rental_count}`}
              </li>
            ))}
          </ul>

          {selectedMovie && (
            <div>
              <h2>Movie Details</h2>
              <p>{`Title: ${selectedMovie.title}`}</p>
              <p>{`Description: ${selectedMovie.description}`}</p>
              <p>{`Release_year: ${selectedMovie.release_year}`}</p>
              <p>{`Rental_duration: ${selectedMovie.rental_duration} Days`}</p>
              <p>{`Rental_rate: ${selectedMovie.rental_rate}`}</p>
              <p>{`Length: ${selectedMovie.length}`}</p>
              <p>{`Rating: ${selectedMovie.rating}`}</p>
              <p>{`Special_features: ${selectedMovie.special_features}`}</p>
            </div>
          )}
        </div>
      ) : null}

      {showActors && topActors.length === 0 ? (
        <p>No actors available</p>
      ) : showActors ? (
        <div>
          <ul>
            {topActors.map((actor) => (
              <li key={actor.first_name} onClick={() => handleActorClick(actor)}>
                {`${actor.first_name} ${actor.last_name}, Film Count: ${actor.film_count}`}
              </li>
            ))}
          </ul>

          {selectedActor && (
            <div>
              <h2>Actor Details</h2>
              <p>{`Name: ${selectedActor.first_name} ${selectedActor.last_name}`}</p>
              <p>{`Actor_ID: ${selectedActor.actor_id}`}</p>
              <h3>Top Movies:</h3>
  <ul>
    {selectedActor.top_movies.map((movie) => (
      <li key={movie.film_id}>{`${movie.title} (ID: ${movie.film_id}) Rental Count${movie.rental_count}`}</li>
    ))}
  </ul>
              
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

const Movies = () => {
  const [keyword, setKeyword] = useState('');
  const [films, setFilms] = useState([]);
  const [showMoviesTable, setShowMoviesTable] = useState(false);
  const [rentalDetails, setRentalDetails] = useState({
    customer_id: '',
    staff_id: '',
    inventory_id: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/search?keyword=${keyword}`);
      setFilms(response.data);
    } catch (error) {
      console.error('Error searching for films:', error);
    }
  };

  const handleFetchAllFilms = async () => {
    try {
      if (showMoviesTable) {
        setShowMoviesTable(false);
      } else {
        const response = await axios.get(`http://localhost:5000/available-rent`);
        setFilms(response.data);
        setShowMoviesTable(true);
      }
    } catch (error) {
      console.error('Error fetching all films:', error);
    }
  };

  const handleRentMovie = async (inventory_id) => {
    try {
      // Assuming customer_id and staff_id are already set in state
      const response = await axios.post('http://localhost:5000/add_rental', {
        customer_id: rentalDetails.customer_id,
        staff_id: rentalDetails.staff_id,
        inventory_id: inventory_id
      });
      console.log(response.data);
      setSuccessMessage('movie has been rented'); // Handle success response
    } catch (error) {
      console.error('Error renting movie:', error);
      setSuccessMessage('movie has not been created');
    }
  };

  const handleChange = (e, key) => {
    setRentalDetails({ ...rentalDetails, [key]: e.target.value });
  };

  const handleSelectMovie = (inventory_id) => {
    const selectedFilm = films.find(film => film.inventory_id === inventory_id);
    setRentalDetails({
      ...rentalDetails,
      inventory_id: selectedFilm.inventory_id,
      customer_id: '', // Clear customer_id when selecting a new movie
      staff_id: ''     // Clear staff_id when selecting a new movie
    });
  };

  return (
    <div>
      <h1>Movies Page</h1>

      <button onClick={handleFetchAllFilms}>
        {showMoviesTable ? 'Hide movies available for renting' : 'Check movies available for renting'}
      </button>

      {showMoviesTable && (
        <div>
          <h2>Available Movies for Renting</h2>
          {successMessage && <p>{successMessage}</p>}
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Rental Rate</th>
                <th>Inventory_id</th>
                <th>Customer ID</th>
                <th>Staff ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {films.map((film) => (
                <tr key={film.film_id}>
                  <td>{film.title}</td>
                  <td>{film.rental_rate}</td>
                  <td>{film.inventory_id}</td>
                  <td>
                    <input
                      type="text"
                      value={rentalDetails.customer_id}
                      onChange={(e) => handleChange(e, 'customer_id')}
                      disabled={rentalDetails.inventory_id !== film.inventory_id}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={rentalDetails.staff_id}
                      onChange={(e) => handleChange(e, 'staff_id')}
                      disabled={rentalDetails.inventory_id !== film.inventory_id}
                    />
                  </td>
                  <td>
                    <button onClick={() => handleSelectMovie(film.inventory_id)}>Select</button>
                    <button onClick={() => handleRentMovie(film.inventory_id)} disabled={rentalDetails.inventory_id !== film.inventory_id}>Rent</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p>Search Movies by Title or actors name or the Category</p>
      <input
        type="text"
        placeholder="Search for a movie..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};


const Customers = () => {
  const [showCustomers, setShowCustomers] = useState(false);
  const [customerData, setCustomerData] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(20);
  const [formData, setFormData] = useState({
    store_id: '',
    first_name: '',
    last_name: '',
    email: '',
    address_id: '',
  });
  const [customerIdToDelete, setCustomerIdToDelete] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [EditMessage, setEditMessage] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editedFormData, setEditedFormData] = useState({ ...formData });
  const [rentalInfo, setRentalInfo] = useState([]);
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState('');

  useEffect(() => {
    if (showCustomers) {
      fetchCustomers();
    }
  }, [currentPage, showCustomers]);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/customers?page=${currentPage}&limit=${customersPerPage}`);
      setCustomerData(response.data.customers);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const toggleCustomers = () => {
    setShowCustomers(!showCustomers);
    setCurrentPage(1);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/search/customers?keyword=${keyword}`);
      setCustomerData(response.data);
    } catch (error) {
      console.error('Error searching for customers:', error);
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleChange = (e) => {
    setEditedFormData({ ...editedFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/create_customer', editedFormData);
      console.log(response.data);
      setSuccessMessage('Customer created successfully');
      setTimeout(() => {
        setSuccessMessage(null);
    }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setSuccessMessage('Customer has not been created');
      setTimeout(() => {
        setSuccessMessage(null);
    }, 2000);

    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/delete_customer/${customerIdToDelete}`);
      console.log(response.data);
      setDeleteMessage('Customer deleted successfully');
      setTimeout(() => {
        setDeleteMessage(null);
    }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setDeleteMessage('NO Id matches that');
      setTimeout(() => {
        setDeleteMessage(null);
    }, 2000);
    }
  };

/* Renatl stuff */
  const fetchRentalInfo = async () => {
    try {

      
        const response = await axios.get(`http://localhost:5000/rental_info?customer_id=${customerId}`);
        setRentalInfo(response.data);
        setError('');
    } catch (error) {
        setRentalInfo([]);
        setError('Error retrieving rental information. Please try again.');
    }
};

const handleRentalSubmit = (e) => {
  e.preventDefault();
  fetchRentalInfo();
};


const handlerentalChange = (event) => {
  setCustomerId(event.target.value);
};


const handleReturnMovie = async (rentalId) => {
  try {


    const response = await axios.post(`http://localhost:5000/rental_movie/${rentalId}`);

    if (!response.data || response.status !== 200) {
      throw new Error(response.data.error || 'Failed to return movie');
    }

    // Update rentalInfo after successful return
    setRentalInfo(rentalInfo.filter(rental => rental.rental_id !== rentalId));
  } catch (error) {
    setError(error.message);
  }
};


/* Edit stuff */
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setEditedFormData(customer);
  };

  const handleUpdate = async (e) => {

    e.preventDefault();
    try {
      
      const response = await axios.put(`http://localhost:5000/customers-edit/${editingCustomer.customer_id}`, editedFormData);
      console.log(response.data);
      setEditMessage('Customer updated successfully');
      setTimeout(() => {
        setEditMessage(null);
    }, 2000);

    } catch (error) {
      console.error('Error:', error);
      setEditMessage('Customer has not been updated');

      setTimeout(() => {
        setEditMessage(null);
    }, 2000);
    }
  };

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customerData.slice(indexOfFirstCustomer, indexOfLastCustomer);

  return (
    <div>
      <h1>Customers Page</h1>
      <p></p>
      <div>
        <h2>Create Customer</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="store_id" placeholder="Store ID" onChange={handleChange} />
          <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} />
          <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} />
          <input type="text" name="address_id" placeholder="Address ID" onChange={handleChange} />
          <br></br>
          <button type="submit">Create Customer</button>
        </form>
        {successMessage && <p>{successMessage}</p>}
      </div>
      <div>
        <h2>Delete Customer</h2>
        <input type="text" placeholder="Enter Customer ID to Delete" onChange={(e) => setCustomerIdToDelete(e.target.value)} />
        <button onClick={handleDelete}>Delete Customer</button>
        {deleteMessage && <p>{deleteMessage}</p>}
      </div>
  <br>
  </br>
  <br>
  </br>
  <div>
  <h2>View Rental Information</h2>
    <form onSubmit={handleRentalSubmit}>
        <label>
            Enter Customer ID:
            <input type="text" placeholder="Enter Customer ID" value={customerId} onChange={handlerentalChange} />
        </label><br></br>
        <button type="submit">Rental Info</button>
    </form>
    {error && <p>{error}</p>}
    {rentalInfo.length > 0 && (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Rental</th>
                        <th>Movie Title</th>
                        <th>Rental Start Date</th>&nbsp;&nbsp;
                        <th>Rental Return Date</th>
                    </tr>
                </thead>
                <tbody>
                    {rentalInfo.map((rental, index) => (
                        <tr key={index}>
                            <td>{rental.first_name}</td>
                            <td>{rental.rental_id}</td>
                            <td>{rental.movie_title}</td>
                            <td>{rental.rental_start_date}</td>&nbsp;&nbsp;
                            <td>{rental.rental_return_date || 'Not Returned'}</td>
                                    <td>
                                        {!rental.rental_return_date && (
                                            <button onClick={() => handleReturnMovie(rental.rental_id)}>Return</button>
                                        )}
                                    </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )}
</div>


      <br></br>
      <br></br>
      <h2>View Customer Information</h2>
      <button onClick={toggleCustomers}>
        {showCustomers ? 'Hide Customers' : 'Load Customers'}
      </button>
      {showCustomers && (
        <div>
          <p>Search Customers by First name , last name  or ID</p>
          <input
            type="text"
            placeholder="Search for a customer based on their first name, last name, or ID"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
          {currentCustomers.length > 0 ? (
            <div>
              <table>
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Address ID</th>
                    <th>Active</th>
                    <th>Create Date</th>&nbsp;&nbsp;
                    <th>Last Update</th>&nbsp;
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.map((customer) => (
                    <tr key={customer.customer_id}>
                      <td>{customer.customer_id}</td>
                      <td>{customer.first_name}</td>
                      <td>{customer.last_name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.address_id}</td>
                      <td>{customer.active ? 'Yes' : 'No'}</td>
                      <td>{customer.create_date}</td>&nbsp;&nbsp;
                      <td>{customer.last_update}</td>&nbsp;&nbsp;&nbsp;
                      <td>
                        <button onClick={() => handleEdit(customer)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="page">
                {Array.from({ length: Math.ceil(customerData.length / customersPerPage) }, (_, i) => (
                  <li key={i} onClick={() => paginate(i + 1)}>
                    {i + 1}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No customers found.</p>
          )}
        </div>
      )}
      {editingCustomer && (
        <div>
          <h2>Edit Customer</h2>
          <form onSubmit={handleUpdate}>
            <input type="text" name="first_name" value={editedFormData.first_name} placeholder="First Name" onChange={handleChange} />
            <input type="text" name="last_name" value={editedFormData.last_name} placeholder="Last Name" onChange={handleChange} />
            <input type="email" name="email" value={editedFormData.email} placeholder="Email" onChange={handleChange} />
            <input type="text" name="address_id" value={editedFormData.address_id} placeholder="Address ID" onChange={handleChange} />
            <br />
            <button type="submit">Update Customer</button>
          </form>
          {EditMessage && <p>{EditMessage}</p>}
        </div>
      )}
    <br></br>
     <br></br>
     <br></br>
     <br></br>
      <br></br>
      <br></br>
    </div>

  );
};


const App = () => {
  return (
    <Router>
      <div>
        <nav className="navbar">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/movies">Movies</Link>
            </li>
            <li>
              <Link to="/customers">Customers</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/movies" element={<Movies />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
