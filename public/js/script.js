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
            console.log("mountet TAG!!!");
            this.tag = this.id.slice(6);
            console.log("tag in tag-component: ", this.tag);
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
                console.log("mounted axios in get tags");
                axios
                    .get(this.id)
                    .then(function(res) {
                        console.log("response from axios GET/tags/: ", res);
                        console.log("red.data[0]: ", res.data);
                        vueInstance.images = res.data;
                    })
                    .catch(err => {
                        console.log("err in GET/tags/:", err);
                    });

                console.log("images: ", this.images);
            },
            closeModal: function() {
                console.log("closeModal clicked worked");
                this.$emit("close", this.id);
                // location.hash = "";
                // history.replaceState(null, null, " ");
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
                console.log("addCom");
                console.log("comment: ", this.comment);
                console.log("usernameComment: ", this.usernameComment);
                console.log("this.id id of image:", this.id);
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
                            vueInstance.comments.unshift(res.data[0]);
                            vueInstance.comment = "";

                            // setTimeout(
                            //     function() {
                            //         let comments = document.getElementById(
                            //             "comments-div"
                            //         );
                            //
                            //         comments.scrollTop =
                            //             comments.scrollHeight -
                            //             comments.clientHeight;
                            //     },
                            //
                            //     200
                            // );
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
                            console.log(
                                "************************axios /selectedimage"
                            );

                            if (res.data[0].length == 0) {
                                vueInstance.closeModal();
                            }
                            vueInstance.username = res.data[0][0].username;
                            vueInstance.title = res.data[0][0].title;
                            vueInstance.description =
                                res.data[0][0].description;
                            vueInstance.url = res.data[0][0].url;
                            vueInstance.comments = res.data[1];
                            vueInstance.smallerId = res.data[0][0].smallerId;
                            vueInstance.biggerId = res.data[0][0].biggerId;
                            vueInstance.tags = res.data[2];
                            vueInstance.created_at = res.data[0][0].created_at
                                .slice(0, 18)
                                .replace("T", " ");

                            // setTimeout(
                            //     function() {
                            //         let comments = document.getElementById(
                            //             "comments-div"
                            //         );
                            //
                            //         comments.scrollTop =
                            //             comments.scrollHeight -
                            //             comments.clientHeight;
                            //     },
                            //
                            //     200
                            // );
                            //
                            // console.log(
                            //     "res from acios /selectedimage: ",
                            //     res.data[3][0].admin
                            // );

                            // console.log("res from axios: ", res.data);
                            //
                            if (res.data[3][0].admin == true) {
                                console.log("add class");

                                var element = document.getElementById(
                                    "deletepic"
                                );
                                console.log("delete: ", element);
                                element.classList.remove("hidden");
                            }

                            // comments.scrollHeight - comments.clientHeight;

                            // console.log(
                            //     comments[0].scrollHeight -
                            //         comments[0].clientHeight
                            // );

                            // console.log(
                            //     "URLLLLL !!!!!!!!!:  ",
                            //     vueInstance.url
                            // );

                            // let img = document.getElementById("imageid");
                            // let width = img.clientWidth;
                            // let height = img.clientHeight;
                            // console.log("img from bigimage");
                            // console.log("width: ", width);
                            // console.log("height: ", height);
                            // let imgInSelected = document.getElementsByClassName(
                            //     "picture"
                            // );
                            // let picture = document.getElementsByClassName(
                            //     "imginselected"
                            // );
                            // let width = imgInSelected[0].offsetWidth;
                            // let height = imgInSelected[0].offsetHeight;
                            //
                            // console.log("width:", width);
                            // console.log("height:", height);
                            // // console.log("picture: ", imgInSelected[0]);
                            // console.log("picture: ", vueInstance.url);
                            //
                            // let img = new Image();
                            //
                            // img.src = vueInstance.url;
                            //
                            // console.log("naturalHeight: ", img.naturalHeight);
                            // console.log("naturalWidth: ", img.naturalWidth);
                            //
                            // if (img.naturalHeight > img.naturalWidth) {
                            //     picture.style.width = "50%";
                            //     picture.style.height = "50%";
                            // } else {
                            //     picture.style.width = "50%";
                            //     picture.style.height = "50%";
                            // }

                            // console.log(
                            //     "created_at!!!!: ",
                            //     vueInstance.created_at
                            // );
                            //
                            // var currentDate = vueInstance.created_at;
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
                console.log("deleteImage clicked!!!!!");
                console.log("id of deleted imagge: ", this.id);
                console.log("biggerId: ", this.biggerId);
                console.log("smallerId: ", this.smallerId);
                if (this.biggerId == null) {
                    location.hash = "#" + this.smallerId;
                } else if (this.smallerId == null) {
                    location.hash = "#" + this.biggerId;
                } else if (this.id == undefined) {
                    // location.hash = "#" + this.biggerId;
                    console.log("id == undefined?!!!", this.id);
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
                console.log("Evenat listerner");
                vueInstance.selectedImage = location.hash.slice(1);
            });

            axios.get("/images").then(function(res) {
                console.log("**************************axios.get/images");

                // if (!res.data[res.data.length - 1].id == undefined) {
                var lastId = res.data[res.data.length - 1].id;
                // }
                console.log("IMAGES: ", vueInstance.images);
                // console.log("lastId: ", lastId);
                vueInstance.lastId = lastId;
                console.log("last id", lastId);
                vueInstance.images = res.data;
            });
        },

        methods: {
            handleClick: function(e) {
                e.preventDefault();
                console.log("in upload");
                let icons = document.getElementsByClassName("icon");
                let inputs = document.getElementsByClassName("inputs");
                let uploading = document.getElementsByClassName("uploading");

                inputs[0].classList.add("hidden");
                uploading[0].classList.remove("hidden");

                console.log("form", inputs);
                // console.log("icon: ", elements);

                for (let i = 0; i < icons.length; i++) {
                    icons[i].classList.add("rotate");
                }

                console.log("title", this.title);
                console.log("description", this.description);

                if (
                    // this.title == "" ||
                    // this.title == null ||
                    // this.description == "" ||
                    // this.description == null ||
                    // this.username == "" ||
                    // this.username == "" null
                    // this.file == "" ||
                    // this.file == null ||
                    // this.tags == "" ||
                    // this.tags == null
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
                    //by wyslac cos do servera musze zrobic to:
                    var formData = new FormData();
                    // console.log("this.file.size", this.file.size);
                    if (this.file.size == 0) {
                        inputs[0].classList.remove("hidden");
                    } else {
                        formData.append("title", this.title);
                        formData.append("description", this.description);
                        formData.append("username", this.username);
                        formData.append("file", this.file);
                        formData.append("tags", this.tags);

                        console.log("this z upload picture: ", this.file);
                        //console.log("formData: ", formData); // to jest pusty obj nic szegolnego

                        var vueInstance = this;
                        axios
                            .post("/upload", formData)
                            .then(function(resp) {
                                console.log(
                                    "resp.data.success",
                                    resp.data.success
                                );
                                // elements.classList.remove("rotate");

                                vueInstance.title = "";
                                vueInstance.description = "";
                                vueInstance.file = null;
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
                                // vueInstance.wrongFormat = true;
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
            closeMe: function(count) {
                console.log("i need to close the modal", count);
                this.selectedImage = null;
                // in here we can update the value of selectedFruit
            },
            closeTag: function(count) {
                console.log("i need to close the modal", count);
                this.tag = null;
                // in here we can update the value of selectedFruit
            },
            showmore: function(e) {
                e.preventDefault();
                console.log("showmore:");
                console.log("this.lastId: ", this.lastId);
                var vueInstance = this;
                axios.get("/showmore/" + this.lastId).then(function(res) {
                    console.log("**************************axios.get/showmore");
                    // console.log("res.data[0]: ", res.data[0]);
                    // console.log("res.data.length: ", res.data.length);
                    // console.log(
                    //     "id of last element of response: ",
                    //     res.data[res.data.length - 1].id
                    // );
                    // console.log("lastId old: ", vueInstance.lastId);
                    // console.log("res.data: ", res.data);
                    vueInstance.lastId = res.data[res.data.length - 1].id;
                    // console.log("res.data[0].id: ", res.data[0].id);
                    // console.log(
                    //     "vueInstance.lastId lastId new: ",
                    //     vueInstance.lastId
                    // );
                    // console.log("res.data[0].lowestId: ", res.data[0].lowestId);

                    for (var i = 0; i < res.data.length; i++) {
                        vueInstance.images.push(res.data[i]);
                        if (vueInstance.lastId == res.data[0].lowestId) {
                            // console.log("innnnn ifffff");
                            // console.log("vueInstance.lastId == null:");
                            vueInstance.lastId = null;
                        }
                    }
                });
            },
            showByTags: function(tag) {
                console.log("showByTags!!!!!!!!!!!!!!!!!!!!: ", tag);
                this.tag = tag;
            },
            closeNoMoreFruit: function() {
                console.log("closeNoMoreFruit clicked!!!!!");
                this.noFruit = null;
                this.wrongFormat = null;
                this.emptyFields = null;
            }
        }
    });
})();
