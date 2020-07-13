### Fruity Board

In this project I used Vue.js for the first time. Inspiration came with love for colors, taste and beautiful symmetrical patterns of fruits. Main conception was to give opportunity to just share images where is at least one visible random fruit. Uploaded Pictures are filtered with help of Google API, pictures without fruits are rejected. Uploading pictures you can add: title, author, tags and description.

---

### Frontend

For frontend I used just pure HTML/CSS.

![img](./images_readme/1.png)

---

### Backend

Backend was build with PostgreSQL for database and Node.js with Express server for the rest.
Uploaded pictures are sent to AWS S3, in database are stored only URLs.

![img](./images_readme/3.png)

When picture is rejected you can see message:

![img](./images_readme/4.png)

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
