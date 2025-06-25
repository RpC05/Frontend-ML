import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService { 
  private baseUrl = 'https://backend-ml-j9hg.onrender.com'; 
 
  private predictUrl = `${this.baseUrl}/predict`;
  private feedbackUrl = `${this.baseUrl}/feedback`;

  constructor(private http: HttpClient) {}
   
  Predictions(data: any): Observable<any> {
    const headers = new HttpHeaders({ 
      'Content-Type': 'application/json',  
    });
    return this.http.post(this.predictUrl, data, { headers });
  } 
   
  sendFeedback(feedbackData: { prediction_group_id: string; observed_sales: { [key: string]: number } }): Observable<any> {
    const headers = new HttpHeaders({ 
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    });
    return this.http.post(this.feedbackUrl, feedbackData, { headers });
  }
}