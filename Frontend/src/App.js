

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

  const handleSearch = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/search?keyword=${keyword}`);
          setFilms(response.data);
      } catch (error) {
          console.error('Error searching for films:', error);
      }
  };

  return (
    
      <div>
        <p> Search Movies by Title or actors name or the Catagoery</p>
          <input
              type="text"
              placeholder="Search for a movie..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
          />
         
          <button onClick={handleSearch}>Search</button>
          <div>
              {films.map((film) => (
                  <div key={film.id}>
                      <h3>{film.title}</h3>
                      <p>{`Description: ${film.description}`}</p>
                      <p>{`Release_year: ${film.release_year}`}</p>
                      <p>{`Rental_duration: ${film.rental_duration} Days`}</p>
                      <p>{`Rental_rate: ${film.rental_rate}`}</p>
                      <p>{`Length: ${film.length}`}</p>
                      <p>{`Rating: ${film.rating}`}</p>
                      <p>{`Special_features: ${film.special_features}`}</p>
                  </div>
              ))}
          </div>
      </div>
  );
};


const Customers = () => {
  const [customerData, setCustomerData] = useState([]);
  const [showCustomers, setShowCustomers] = useState(false);

  const fetchCustomers = () => {
    if (showCustomers) {
      setCustomerData([]);
    } else {
      fetch('http://localhost:5000/customers')
        .then(response => response.json())
        .then(data => {
          setCustomerData(data.customers);
        })
        .catch(error => console.error('Error fetching customers:', error));
    }
    setShowCustomers(!showCustomers);
  };

  return (
    <div>
      <h1>Customers Page</h1>
      <p>This is the customers page.</p>
      <button onClick={fetchCustomers}>{showCustomers ? 'Hide Customers' : 'Load Customers'}</button>
      {showCustomers && (
        <div>
          {customerData.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Address ID</th>
                  <th>Active</th>
                  <th>Create Date</th>
                  <th>Last Update</th>
                </tr>
              </thead>
              <tbody>
                {customerData.map(customer => (
                  <tr key={customer.customer_id}>
                    <td>{customer.customer_id}</td>
                    <td>{customer.first_name}</td>
                    <td>{customer.last_name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.address_id}</td>
                    <td>{customer.active ? 'Yes' : 'No'}</td>
                    <td>{customer.create_date}</td>
                    <td>{customer.last_update}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No customers found.</p>
          )}
        </div>
      )}
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
