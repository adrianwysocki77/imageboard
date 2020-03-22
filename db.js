const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/imageboard"
);

exports.getAll = function() {
    return db.query(`SELECT * FROM images ORDER BY id DESC
        LIMIT 20`);
};

exports.addImage = function(url, username, title, description) {
    return db
        .query(
            `INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4) RETURNING *`, ///zapobiega atakom  //
            [url, username, title, description]
        )
        .then(({ rows }) => rows);
};

exports.insertComment = function(username, imageId, comment) {
    return db
        .query(
            `INSERT INTO comments (username, image_id, comment)
        VALUES ($1, $2, $3)
        RETURNING *`,
            [username, imageId, comment]
        )
        .then(({ rows }) => rows);
};

exports.selectImage = function(id) {
    return db
        .query(
            `SELECT *,
            (SELECT min(id) FROM images WHERE id>$1) AS "biggerId",
            (SELECT max(id) FROM images WHERE id<$1) AS "smallerId"
             FROM images WHERE id = $1`,
            [id]
        )
        .then(({ rows }) => rows);
};

exports.selectAllComments = function(imageId) {
    return db
        .query(
            `SELECT * FROM comments
        WHERE image_id=$1`,
            [imageId]
        )
        .then(({ rows }) => rows);
};

exports.showMore = function(id) {
    return db
        .query(
            `SELECT *, (
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1
        ) AS "lowestId" FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 10;`,
            [id]
        )
        .then(({ rows }) => rows);
};

exports.insertTag = function(tag, image_id) {
    return db
        .query(
            `INSERT INTO tags (tag, image_id )
        VALUES ($1, $2)
        RETURNING *`,
            [tag, image_id]
        )
        .then(({ rows }) => rows);
};

exports.selectAllTags = function(image_id) {
    return db
        .query(
            `SELECT * FROM tags
        WHERE image_id=$1`,
            [image_id]
        )
        .then(({ rows }) => rows);
};

exports.getImagesByTags = function(tag) {
    return db
        .query(
            `SELECT *
        FROM images
        JOIN
        tags
        ON
        images.id = tags.image_id
        WHERE tag = $1
        `,
            [tag]
        )
        .then(({ rows }) => rows);
};
