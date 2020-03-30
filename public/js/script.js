(function() {
    Vue.component("tag-component", {
        template: "#templatetwo",
        props: ["id"],
        data: function() {
            return {
                tag: null,
                images: null
            };
        },
        mounted: function() {
            this.tag = this.id.slice(6);
            this.mountedAxios();
        },
        watch: {
            id: function() {
                console.log("in tag watch!!! this.id:", this.id);
            }
        },
        methods: {
            // closeModal: function() {
            //     console.log("closeModal clicked worked");
            //     this.$emit("close", this.id);
            //     // location.hash = "";
            //     history.replaceState(null, null, " ");
            // },
            mountedAxios: function() {
                let vueInstance = this;
                axios
                    .get(this.id)
                    .then(function(res) {
                        vueInstance.images = res.data;
                    })
                    .catch(err => {
                        console.log("err in GET/tags/:", err);
                    });
            },
            closeModal: function() {
                this.$emit("close", this.id);
            }
        }
    });

    Vue.component("first-component", {
        template: "#template",
        props: ["id"],
        data: function() {
            return {
                username: null,
                title: null,
                description: null,
                url: null,
                comment: null,
                usernameComment: null,
                comments: null,
                smallerId: null,
                biggerId: null,
                tags: null,
                tag: null,
                created_at: "",
                empty_comment: null
            };
        },
        mounted: function() {
            let vueInstance = this;
            addEventListener("keydown", function(e) {
                if (e.keyCode == 27) {
                    vueInstance.closeModal();
                }
                if (e.keyCode == 37) {
                    if (vueInstance.smallerId != null) {
                        console.log("left arr");
                        location.hash = "#" + vueInstance.smallerId;
                    }
                }
                if (e.keyCode == 39) {
                    if (vueInstance.biggerId != null) {
                        console.log("right arr");
                        location.hash = "#" + vueInstance.biggerId;
                    }
                }
            });
            this.mountedAxios();
        },
        watch: {
            id: function() {
                if (
                    this.id < -2147483648 || //pqsl limit for int
                    this.id > 2147483647
                ) {
                    this.closeModal();
                } else if (this.id.startsWith("/tags/")) {
                    let tag = this.id.slice(6);
                    this.tagToMain(tag);
                } else {
                    this.mountedAxios();
                }
            }
        },
        methods: {
            closeModal: function() {
                this.$emit("close", this.id);
                history.replaceState(null, null, " ");
            },
            addComment: function(e) {
                e.preventDefault();
                var vueInstance = this;
                if (this.comment == "" || this.comment == null) {
                    return (vueInstance.empty_comment = true);
                    // return;
                } else {
                    axios
                        .post("/comment", {
                            id: this.id,
                            comment: this.comment,
                            username: this.usernameComment
                        })
                        .then(function(res) {
                            res.data[0].created_at = res.data[0].created_at
                                .slice(0, 18)
                                .replace("T", " ");

                            vueInstance.comments.unshift(res.data[0]);
                            vueInstance.comment = "";
                        })
                        .catch(function(err) {
                            console.log("err in axios POST/comment: ", err);
                        });
                }
            },

            mountedAxios: function() {
                var vueInstance = this;
                if (isNaN(this.id)) {
                    this.closeModal();
                } else {
                    axios
                        .get("/selectedimage/" + this.id)
                        .then(function(res) {
                            if (res.data[0].length == 0) {
                                vueInstance.closeModal();
                            }
                            vueInstance.username = res.data[0][0].username;
                            vueInstance.title = res.data[0][0].title;
                            vueInstance.description =
                                res.data[0][0].description;
                            vueInstance.url = res.data[0][0].url;

                            vueInstance.comments = res.data[1];
                            console.log(vueInstance.comments);
                            ////////////////////////////////////////////////////
                            //EDITING DATE

                            for (
                                let i = 0;
                                i < vueInstance.comments.length;
                                i++
                            ) {
                                vueInstance.comments[
                                    i
                                ].created_at = vueInstance.comments[
                                    i
                                ].created_at
                                    .slice(0, 18)
                                    .replace("T", " ");
                                console.log("Im editing image!!!");
                            }

                            vueInstance.smallerId = res.data[0][0].smallerId;
                            vueInstance.biggerId = res.data[0][0].biggerId;
                            vueInstance.tags = res.data[2];
                            vueInstance.created_at = res.data[0][0].created_at
                                .slice(0, 18)
                                .replace("T", " ");

                            if (res.data[3][0].admin == true) {
                                console.log("add class");

                                var element = document.getElementById(
                                    "deletepic"
                                );
                                element.classList.remove("hidden");
                            }
                        })
                        .catch(err => {
                            console.log(
                                "err in axios get/selectedimage: ",
                                err
                            );
                        });
                }
            },
            tagToMain: function(tag) {
                console.log("tag to main: ", tag);
                this.$emit("tag", tag);
            },
            closeEmptyComment: function() {
                console.log("closeEmptyComment clicked!!!!!");
                this.empty_comment = null;
            },
            deleteImage: function() {
                if (this.biggerId == null) {
                    location.hash = "#" + this.smallerId;
                } else if (this.smallerId == null) {
                    location.hash = "#" + this.biggerId;
                } else {
                    location.hash = "#" + this.biggerId;
                }

                window.location.reload();

                axios
                    .get("/delete/" + this.id)
                    .then(function(res) {
                        console.log("************************axios /delete");
                        console.log("res.data: ", res.data);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        }
    });

    new Vue({
        el: "#main",
        data: {
            selectedImage: location.hash.slice(1),
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            lastId: null,
            tags: "",
            tag: null,
            noFruit: null,
            // wrongFormat: null,
            emptyFields: null
        },
        created: function() {
            console.log("created");
        },
        mounted: function() {
            console.log("mounted");
            var vueInstance = this; // tu trace wartosc this dlatego tworze zmienna ;))))))))))))))))
            addEventListener("hashchange", function() {
                vueInstance.selectedImage = location.hash.slice(1);
            });

            axios.get("/images").then(function(res) {
                var lastId = res.data[res.data.length - 1].id;
                vueInstance.lastId = lastId;
                vueInstance.images = res.data;
            });
        },

        methods: {
            handleClick: function(e) {
                e.preventDefault();
                let icons = document.getElementsByClassName("icon");
                let inputs = document.getElementsByClassName("inputs");
                let uploading = document.getElementsByClassName("uploading");

                inputs[0].classList.add("hidden");
                uploading[0].classList.remove("hidden");

                for (let i = 0; i < icons.length; i++) {
                    icons[i].classList.add("rotate");
                }

                if (
                    this.title == "" ||
                    this.description == "" ||
                    this.username == "" ||
                    this.file == null ||
                    this.tags == ""
                ) {
                    console.log(this.title);
                    console.log(this.description);
                    console.log(this.username);
                    console.log(this.file);
                    console.log(this.tags);

                    this.emptyFields = true;
                    this.noFruit = null;
                    inputs[0].classList.remove("hidden");
                    uploading[0].classList.add("hidden");

                    for (let i = 0; i < icons.length; i++) {
                        icons[i].classList.remove("rotate");
                    }
                } else {
                    this.closeNoMoreFruit();
                    var formData = new FormData();
                    if (this.file.size == 0) {
                        inputs[0].classList.remove("hidden");
                    } else {
                        formData.append("title", this.title);
                        formData.append("description", this.description);
                        formData.append("username", this.username);
                        formData.append("file", this.file);
                        formData.append("tags", this.tags);

                        console.log("this z upload picture: ", this.file);
                        //console.log("formData: ", formData); // FORM DATA SEEMS TO BE EMPTY

                        var vueInstance = this;
                        axios
                            .post("/upload", formData)
                            .then(function(resp) {
                                vueInstance.title = "";
                                vueInstance.description = "";
                                // vueInstance.file = null;
                                vueInstance.tags = "";
                                vueInstance.username = "";

                                if (resp.data.success == false) {
                                    console.log("Sorry, no fruit no upload");
                                    vueInstance.noFruit = true;
                                } else {
                                    vueInstance.images.unshift(resp.data[0]);
                                }
                                for (let i = 0; i < icons.length; i++) {
                                    icons[i].classList.remove("rotate");
                                }
                                inputs[0].classList.remove("hidden");
                                uploading[0].classList.add("hidden");
                            })
                            .catch(function(err) {
                                console.log("err in POST /upload: ", err);
                            });
                    }
                }
            },

            handleChange: function(e) {
                console.log("handleChange is running:", e);
                // console.log("file:", e.target.files[0]);
                this.file = e.target.files[0]; //przypisuje wartos w data
            },
            closeMe: function() {
                this.selectedImage = null;
            },
            closeTag: function() {
                this.tag = null;
            },
            showmore: function(e) {
                e.preventDefault();
                var vueInstance = this;
                axios.get("/showmore/" + this.lastId).then(function(res) {
                    vueInstance.lastId = res.data[res.data.length - 1].id;
                    for (var i = 0; i < res.data.length; i++) {
                        vueInstance.images.push(res.data[i]);
                        if (vueInstance.lastId == res.data[0].lowestId) {
                            vueInstance.lastId = null;
                        }
                    }
                });
            },
            showByTags: function(tag) {
                this.tag = tag;
            },
            closeNoMoreFruit: function() {
                this.noFruit = null;
                this.wrongFormat = null;
                this.emptyFields = null;
            }
        }
    });
})();
