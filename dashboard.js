// Firebase initialization
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const newBlogForm = document.getElementById("new-blog-form");
const blogList = document.getElementById("blog-list");
const userFullname = document.getElementById("user-fullname");
const logoutButton = document.getElementById("logout-button");

// Get the logged-in user's information
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        userFullname.textContent = `Welcome, ${user.displayName}`;

        // Logout
        logoutButton.addEventListener("click", () => {
            firebase.auth().signOut();
            window.location.href = "login.html";
        });

        // Post a new blog
        newBlogForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const blogTitle = newBlogForm["blog-title"].value;
            const blogBody = newBlogForm["blog-body"].value;

            // Store blog in Firestore
            try {
                const docRef = await firebase.firestore().collection("blogs").add({
                    title: blogTitle,
                    body: blogBody,
                    userId: user.uid,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log("Blog posted with ID: ", docRef.id);

                newBlogForm.reset(); // Clear form after posting
            } catch (error) {
                console.error("Error posting blog: ", error);
            }
        });

        // Display existing blogs
        const blogsRef = firebase.firestore().collection("blogs").where("userId", "==", user.uid).orderBy("timestamp", "desc");

        blogsRef.onSnapshot((snapshot) => {
            blogList.innerHTML = ""; // Clear existing blogs
            snapshot.forEach((doc) => {
                const blogData = doc.data();
                const blogDate = blogData.timestamp.toDate().toLocaleDateString();
                const blogHtml = `
                    <div class="blog">
                        <h3>${blogData.title}</h3>
                        <p>${blogData.body}</p>
                        <p>Published on: ${blogDate}</p>
                    </div>
                `;
                blogList.innerHTML += blogHtml;
            });
        });
    } else {
        window.location.href = "login.html"; // Redirect to login if not logged in
    }
});
