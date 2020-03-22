DROP TABLE IF EXISTS tags;

CREATE TABLE tags(
    id SERIAL PRIMARY KEY,
    tag TEXT,
    image_id INT REFERENCES images(id) NOT NULL
);
