const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3010;

app.use(express.json());

app.use(express.static('static'));

const mongoURI = 'mongodb://localhost:27017/blogapp';
mongoose
.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const BlogPostSchema = new mongoose.Schema ({
  title: { type: String, required: true, unique: true, minlength: 5 },
  content: { type: String, required: true, minlength: 50 },
  author: { type: String },
  tags: { type: [String], default: [] },
  category: { type: String, default: 'General' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

// app.get('/', (req, res) => {
//   res.sendFile(resolve(__dirname, 'pages/index.html'));
// });

app.get('/api/blogposts', async (req, res) => {
  try {
    const blogposts = await BlogPost.find();
    res.status(200).json(blogposts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/blogposts', async (req, res) => {
  try {
    const blogPost = new BlogPost(req.body);
    const savedPost = await blogPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  });

app.get('/api/blogposts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await BlogPost.findById({_id:postId});
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });  
  }
});

app.put('/api/blogposts/:id', async (req, res) => {
  try {
    const updatedPost = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    } 
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.delete('/api/blogposts/:id', async (req, res) => {
  try {
    const deletedPost = await BlogPost.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    } 
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
