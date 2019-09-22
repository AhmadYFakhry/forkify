export default class Likes {
    constructor() {
        // List of recipes (similar layout to search result)
        this.likes = [];
    }
    addLike(id, title, author, img) {
        const like = {
            id,
            title,
            author,
            img
        }
        this.likes.push(like);
        // Persist the data in local storage
        this.persistData();
        return like;
    }
    deleteLike(id) {
        // Finds the index that matches the ID
        const index = this.likes.findIndex(el => el.id===id);
        // Removes the specfiied like using splice 
        this.likes.splice(index, 1);
        this.persistData();
    }

    isLiked(id) {
        return this.likes.findIndex(el => el.id===id) !== -1;
    }
    getNumberOfLikes() {
        return this.likes.length;
    }

    persistData() {
        localStorage.setItem('likes', JSON.stringify(this.likes));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem('likes'));
        // Restore all our likes from local storage
        if(storage) this.likes = storage;
    }
}