import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf, KeyValuePipe } from '@angular/common';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, NgFor, NgIf, KeyValuePipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'PredictionRestaurantBere';
  climaOptions = ['Soleado', 'Lluvioso', 'Ventoso', 'Nublado'];
  diaOptions = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  esFinDeSemana = false;
  esFeriado = false;
  clima: string = '';
  nombreDia: string = '';
  imgPath = 'https://iili.io/3Q4dEDG.png';
  
  predictions: { [key: string]: any } | null = null; 
  predictionGroupId: string | null = null; // Guardará el ID del grupo para el feedback
  feedbackGiven = false; 
  observedSales: { [key: string]: number | null } = {};
 
  private diaMapping: { [key: string]: string } = {
    'Lunes': 'monday', 'Martes': 'tuesday', 'Miércoles': 'wednesday',
    'Jueves': 'thursday', 'Viernes': 'friday', 'Sábado': 'saturday', 'Domingo': 'sunday'
  };
 
  private climaMapping: { [key: string]: string } = {
    'Soleado': 'sunny', 'Lluvioso': 'rainy', 'Ventoso': 'windy', 'Nublado': 'cloudy'
  };

  constructor(private apiService: ApiService) {}

  keepOriginalOrder = (a: any, b: any) => 0;

  actualizarFinDeSemana() {
    this.esFinDeSemana = this.nombreDia === 'Sábado' || this.nombreDia === 'Domingo';
  }

  onSubmit() {
    if (!this.clima || !this.nombreDia) {
      alert('Por favor, seleccione un clima y un día.');
      return;
    }

    const data = {
      clima: this.climaMapping[this.clima],
      nombre_dia: this.diaMapping[this.nombreDia],
      es_fin_de_semana: this.esFinDeSemana ? 1 : 0,
      es_feriado: this.esFeriado ? 1 : 0
    };

    this.apiService.Predictions(data).subscribe(
      (response) => {
        console.log('API response:', response);
        this.predictions = response;
        // Guardamos el ID del grupo que viene del backend
        this.predictionGroupId = response.prediction_group_id; 
        this.observedSales = {}; // Limpiamos las ventas observadas anteriores
        this.feedbackGiven = false;
      },
      (error) => {
        console.error('Error al obtener predicciones:', error);
        alert('Error al conectar con el backend. Verifica la URL de ngrok o el estado del servidor.');
      }
    );
  }

  submitFeedback() {
    if (!this.predictionGroupId) {
      alert('No hay un ID de predicción para enviar el feedback.');
      return;
    }

    const cleanObservedSales: { [key: string]: number } = {};
    for (const plato in this.observedSales) {
      const cantidad = this.observedSales[plato];
      if (cantidad !== null && cantidad !== undefined) {
        cleanObservedSales[plato] = Number(cantidad);
      }
    }

    if (Object.keys(cleanObservedSales).length === 0) {
        alert('Por favor, introduce la venta real de al menos un plato.');
        return;
    }

    const feedbackData = {
      prediction_group_id: this.predictionGroupId,
      observed_sales: cleanObservedSales
    };

    console.log('Enviando feedback:', feedbackData);

    this.apiService.sendFeedback(feedbackData).subscribe(
      () => {
        this.feedbackGiven = true;
        alert('¡Gracias! Tu feedback ha sido enviado con éxito.');
      },
      (error) => {
        console.error('Error al enviar el feedback:', error);
        alert('Hubo un error al enviar tu feedback.');
      }
    );
  }
}