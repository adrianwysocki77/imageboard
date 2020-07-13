### Fruity Board

In this project I used Vue.js for the first time. Inspiration came with love for colors, taste and beautiful symmetrical patterns of fruits. Main conception was to give opportunity to just share images where is at least one visible random fruit. Picture is filterd with help of Google API, pictures without fruits are rejected.

---

### Backend

In the back, a Node.js Express server and a PostgreSQL database CRUDfully make sure everything is kept alive.

![img](./images_readme/1.png)

The image board displayes the 20 most recent pictures, upon scrolling down more images are being loaded and displayed

![img](./readme_images/1.gif)

---

### Upload

New images get grabbed using Multer, then uploaded to AWS S3, with a reference stored in the database.

![img](./readme_images/upload.png)

---

### Interaction

Visit a posts page, to get a better look.

![img](./readme_images/comment1.png)

Interact with the author, ask questions, critique, praise, or simply share your thoughts in the comment section.

![img](./readme_images/comment2.png)

---

### Frontend

In the front, Vue.js works its magic.

I wanted the design to be kinda shitty so all icons are carelessly hand drawn with a trackpad.

![img](./readme_images/icons.jpg)

Navigation to different pages is provided with Hash-Routing, so that posts can be sent to other places on the internet.

![img](./readme_images/url.png)

---
