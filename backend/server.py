# Import necessary modules
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func , or_
from flask_cors import CORS

# Create Flask app
app = Flask(__name__)

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:Westwood-18@localhost/sakila'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
CORS(app)

# Define Actor model
class Actor(db.Model):
    __tablename__ = 'actor'
    actor_id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(45))
    last_name = db.Column(db.String(45))
    last_update = db.Column(db.DateTime)

class Film(db.Model):
    __tablename__ = 'film'

    film_id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    release_year = db.Column(db.Integer)
    language_id = db.Column(db.Integer, db.ForeignKey('language.language_id'))
    original_language_id = db.Column(db.Integer, db.ForeignKey('language.language_id'))
    rental_duration = db.Column(db.Integer, default=3)
    rental_rate = db.Column(db.Numeric(4, 2), default=4.99)
    length = db.Column(db.Integer)
    replacement_cost = db.Column(db.Numeric(5, 2), default=19.99)
    rating = db.Column(db.Enum('G', 'PG', 'PG-13', 'R', 'NC-17'), default='G')
    special_features = db.Column(db.String(255))
    last_update = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

    language = db.relationship('Language', foreign_keys=[language_id])
    original_language = db.relationship('Language', foreign_keys=[original_language_id])
    def serialize(self):
        return {
            'film_id': self.film_id,
            'title': self.title,
            'description': self.description,
            'release_year': self.release_year,
            # Add other attributes as needed
        }

class Language(db.Model):
    __tablename__ = 'language'

    language_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), nullable=False)
    last_update = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())

class Inventory(db.Model):
    __tablename__ = 'inventory'

    inventory_id = db.Column(db.Integer, primary_key=True)
    film_id = db.Column(db.Integer, db.ForeignKey('film.film_id'))
    store_id = db.Column(db.Integer, db.ForeignKey('store.store_id'))
    last_update = db.Column(db.DateTime)

class Rental(db.Model):
    __tablename__ = 'rental'

    rental_id = db.Column(db.Integer, primary_key=True)
    rental_date = db.Column(db.DateTime)
    inventory_id = db.Column(db.Integer, db.ForeignKey('inventory.inventory_id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id'))
    return_date = db.Column(db.DateTime)
    staff_id = db.Column(db.Integer, db.ForeignKey('staff.staff_id'))
    last_update = db.Column(db.DateTime)

class FilmActor(db.Model):
    __tablename__ = 'film_actor'

    actor_id = db.Column(db.Integer, db.ForeignKey('actor.actor_id'), primary_key=True)
    film_id = db.Column(db.Integer, db.ForeignKey('film.film_id'), primary_key=True)
    last_update = db.Column(db.DateTime, nullable=False)

class Category(db.Model):
    __tablename__ = 'category'

    category_id = db.Column(db.SmallInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String(25), nullable=False)

class FilmCategory(db.Model):
    __tablename__ = 'film_category'

    film_id = db.Column(db.Integer, db.ForeignKey('film.film_id'), primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('category.category_id'), primary_key=True)
    last_update = db.Column(db.DateTime)
    film = db.relationship('Film', backref=db.backref('film_categories'))
    category = db.relationship('Category', backref=db.backref('film_categories'))

@app.route('/', methods=['GET'])
def get_actors():
    actors = Actor.query.all()
    actor_list = []
    for actor in actors:
        actor_data = {
            'actor_id': actor.actor_id,
            'first_name': actor.first_name,
            'last_name': actor.last_name,
            'last_update': actor.last_update.strftime('%Y-%m-%d %H:%M:%S')
        }
        actor_list.append(actor_data)
    return jsonify({'actors': actor_list})

@app.route('/top_movies', methods=['GET'])
def get_top5_most_rented_movies():
    # Join the Film, Inventory, and Rental tables
    query = (
        db.session.query(
            Film.film_id,
            Film.title,
            Film.description,
            Film.release_year,
            Film.language_id,
            Film.rental_duration,
            Film.rental_rate,
            Film.length,
            Film.rating,
            Film.special_features,
            func.count(Rental.rental_id).label('rental_count')
        )
        .join(Inventory, Film.film_id == Inventory.film_id)
        .join(Rental, Inventory.inventory_id == Rental.inventory_id)
        .group_by(Film.film_id, Film.title, Film.description, Film.release_year, Film.language_id,
                  Film.rental_duration, Film.rental_rate, Film.length, Film.rating, Film.special_features)
        .order_by(func.count(Rental.rental_id).desc())
        .limit(5)
    )

    result = query.all()

    # Convert the result to a list of dictionaries
    movies = [
        {
            'film_id': row.film_id,
            'title': row.title,
            'description': row.description,
            'release_year': row.release_year,
            'language_id': row.language_id,
            'rental_duration': row.rental_duration,
            'rental_rate': float(row.rental_rate),  # Convert Numeric to float
            'length': row.length,
            'rating': row.rating,
            'special_features': row.special_features,
            'rental_count': row.rental_count
        }
        for row in result
    ]

    return jsonify(movies)

@app.route('/top_actors', methods=['GET'])
def top_actors_and_movies():
    # SQLAlchemy query to get the top 5 actors based on the number of films they appeared in
    top_actors = db.session.query(
        Actor.actor_id,
        Actor.first_name,
        Actor.last_name,
        db.func.count(FilmActor.film_id).label('film_count')
    ).join(
        FilmActor, Actor.actor_id == FilmActor.actor_id
    ).group_by(
        Actor.actor_id,
        Actor.first_name,
        Actor.last_name
    ).order_by(
        db.func.count(FilmActor.film_id).desc()
    ).limit(5).all()

    # Create a list to store the results
    result = []

    # Iterate through the top actors and retrieve their top 5 rented movies
    for actor in top_actors:
        actor_data = {
            'actor_id': actor.actor_id,
            'first_name': actor.first_name,
            'last_name': actor.last_name,
            'film_count': actor.film_count,
            'top_movies': []
        }

        # SQLAlchemy query to get the top 5 rented movies for each actor along with rental count
        top_movies = db.session.query(
            Film.film_id,
            Film.title,
            db.func.count(Rental.rental_id).label('rental_count')
        ).join(
            FilmActor, Film.film_id == FilmActor.film_id
        ).join(
            Inventory, Film.film_id == Inventory.film_id
        ).join(
            Rental, Inventory.inventory_id == Rental.inventory_id
        ).filter(
            FilmActor.actor_id == actor.actor_id
        ).group_by(
            Film.film_id,
            Film.title
        ).order_by(
            db.func.count(Rental.rental_id).desc()
        ).limit(5).all()

        # Append the top movies to the actor_data
        actor_data['top_movies'] = [
            {'film_id': movie.film_id, 'title': movie.title, 'rental_count': movie.rental_count}
            for movie in top_movies
        ]

        # Append actor_data to the result list
        result.append(actor_data)

    # Return the result as JSON
    return jsonify(result)

@app.route('/search', methods=['GET'])
def search_films():
    search_term = request.args.get('keyword')

    films = db.session.query(Film).\
        join(FilmActor, Film.film_id == FilmActor.film_id).\
        join(Actor, FilmActor.actor_id == Actor.actor_id).\
        join(FilmCategory, Film.film_id == FilmCategory.film_id).\
        join(Category, FilmCategory.category_id == Category.category_id).\
        filter(or_(
            Film.title.ilike(f'%{search_term}%'),  # Search by film title
             (Actor.first_name + ' ' + Actor.last_name).ilike(f'%{search_term}%'),  # Search by actor full name
            Category.name.ilike(f'%{search_term}%')  # Search by category/genre
        )).all()

    # Convert SQLAlcheiiiimy objects to dictionaries for JSON serialization
    films_json = []
    for film in films:
        film_dict = {
            'film_id': film.film_id,
            'title': film.title,
            'description': film.description,
            'release_year': film.release_year,
            'rental_duration': film.rental_duration,
            'rental_rate': float(film.rental_rate),  # Convert Numeric to float
            'length': film.length,
            'rating': film.rating,
            'special_features': film.special_features,
            # Add more fields as needed
        }
        films_json.append(film_dict)

    return jsonify(films_json)

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
