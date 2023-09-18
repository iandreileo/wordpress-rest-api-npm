class Wordpress {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getPosts(page = 1, perPage = 10) {
    return this.getPostsByType("post", page, perPage);
  }

  async getCustomPosts(customPostType, page = 1, perPage = 10) {
    return this.getPostsByType(customPostType, page, perPage);
  }

  async getStickyPosts(page = 1, perPage = 10) {
    return this.getPostsByType("post", page, perPage, true);
  }

  // Doc: Needs custom function on the server for "category_slug"
  // https://stackoverflow.com/questions/28540075/how-can-i-get-a-list-of-posts-for-a-category-with-wp-api
  async getPostsByCategory(category_slug, page = 1, perPage = 10) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        category_slug: category_slug,
        _embed: true,
      });

      const response = await fetch(
        `${this.baseURL}/wp-json/wp/v2/posts?${queryParams}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch posts for category ${category_slug}: ${response.statusText}`
        );
      }

      // Extract headers to get total count and pages information
      const totalCount = response.headers.get("X-WP-Total");
      const totalPages = response.headers.get("X-WP-TotalPages");

      const data = await response.json();

      return {
        posts: data,
        totalNumberOfPosts: totalCount,
        totalPages: totalPages,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch posts for category ${category_slug}: ${error.message}`
      );
    }
  }

  async getPostById(postId) {
    try {
      const response = await fetch(
        `${this.baseURL}/wp-json/wp/v2/posts/${postId}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch post with ID ${postId}: ${response.statusText}`
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        `Failed to fetch post with ID ${postId}: ${error.message}`
      );
    }
  }

  async getPostBySlug(slug) {
    try {
      const response = await fetch(
        `${this.baseURL}/wp-json/wp/v2/posts?slug=${slug}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch post with slug ${slug}: ${response.statusText}`
        );
      }
      const [post] = await response.json();
      return post;
    } catch (error) {
      throw new Error(
        `Failed to fetch post with slug ${slug}: ${error.message}`
      );
    }
  }

  async getSimilarPostsBySlug(slug) {
    try {
      const targetPost = await this.getPostBySlug(slug);

      if (!targetPost) {
        throw new Error(`No post found with slug ${slug}`);
      }

      // Customize the query parameters and criteria based on your requirements
      const queryParams = new URLSearchParams({
        per_page: 5, // Number of similar posts to fetch
        // Add other query parameters or criteria as needed
      });

      const response = await fetch(
        `${this.baseURL}/wp-json/wp/v2/posts/${targetPost.id}/related?${queryParams}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch similar posts for post with slug ${slug}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        `Failed to fetch similar posts for post with slug ${slug}: ${error.message}`
      );
    }
  }

  async getPostsByType(postType, page = 1, perPage = 10, sticky = false) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        sticky: sticky ? "true" : "false",
        _embed: true,
      });

      const response = await fetch(
        `${this.baseURL}/wp-json/wp/v2/${postType}?${queryParams}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${postType} posts: ${response.statusText}`
        );
      }

      // Extract headers to get total count and pages information
      const totalCount = response.headers.get("X-WP-Total");
      const totalPages = response.headers.get("X-WP-TotalPages");

      const data = await response.json();

      console.log(response);

      return {
        posts: data,
        totalNumberOfPosts: totalCount,
        totalPages: totalPages,
      };
    } catch (error) {
      throw new Error(`Failed to fetch ${postType} posts: ${error.message}`);
    }
  }

  async getCategories() {
    try {
      const response = await fetch(`${this.baseURL}/wp-json/wp/v2/categories`);
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }
}

module.exports = Wordpress;
