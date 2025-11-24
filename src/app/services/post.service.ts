import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  id: number;
  content: string;
  mediaUrl?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  weatherContext?: string;
  user: {
    id: number;
    username: string;
    profilePictureUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  showComments?: boolean;
  comments?: Comment[];
  likes?: number;
}

export interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    username: string;
  };
  createdAt: string;
}

export interface CreatePostRequest {
  content: string;
  media?: File;
  latitude?: number;
  longitude?: number;
  weatherContext?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = '/api/posts';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getPosts(location?: string): Observable<Post[]> {
    const params: any = {};
    if (location) {
      params.location = location;
    }
    return this.http.get<Post[]>(this.apiUrl, { params });
  }

  createPost(postData: CreatePostRequest): Observable<Post> {
    const formData = new FormData();
    formData.append('content', postData.content);
    if (postData.media) {
      formData.append('media', postData.media);
    }
    if (postData.latitude) {
      formData.append('latitude', postData.latitude.toString());
    }
    if (postData.longitude) {
      formData.append('longitude', postData.longitude.toString());
    }
    if (postData.weatherContext) {
      formData.append('weatherContext', postData.weatherContext);
    }

    return this.http.post<Post>(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  updatePost(id: number, content: string): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, { content }, { headers: this.getHeaders() });
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
