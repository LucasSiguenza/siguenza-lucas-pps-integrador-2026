import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { Elemento } from '../../models/elementos'; // Asegúrate de importar la interfaz
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, BarController, PieController } from 'chart.js';
import { ElementoSb } from 'src/app/servicios/elemento-sb';
import { MarlujoHeaderComponent } from "src/app/componentes/marlujo-header/marlujo-header.component";
import { Utils } from 'src/app/servicios/utils';
import { FotoGraficoComponent } from 'src/app/componentes/modales/foto-grafico/foto-grafico.component';

// Registra los controladores, elementos y escalas necesarios
Chart.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  BarController,   // Asegúrate de registrar el controlador de barras
  PieController    // También registramos el controlador para el gráfico de torta
);
@Component({
  selector: 'app-graficos',
  templateUrl: './graficos.page.html',
  styleUrls: ['./graficos.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, MarlujoHeaderComponent]
})
export class GraficosPage implements OnInit {
  lindos: Elemento[] = []; // Aquí estarán los "lindos"
  feos: Elemento[] = []; // Aquí estarán los "feos"

  private modalCtrl = inject(ModalController)
  private elemSvc = inject(ElementoSb)
  private utilSvc = inject(Utils)

  async ngOnInit() {
    const carga = await this.utilSvc.loading();
    await carga.present()
    // Suponiendo que `elementos` es tu array de datos
    const elementos: Elemento[] = await this.getElementos(); // Método que obtiene los datos

    // Filtramos y ordenamos los elementos
    this.lindos = elementos.filter(e => e.tipo === 'lindo').sort((a, b) => b.votos! - a.votos!).slice(0, 4);
    this.feos = elementos.filter(e => e.tipo === 'feo').sort((a, b) => b.votos! - a.votos!).slice(0, 4);

    this.renderCharts();
    await carga.dismiss()
  }
private readonly COLORES = [
  '#00BEDC', // A-3
  '#1D9DB1', // A-1
  '#2D7A86', // A-2
  '#2E565C', // A-4
  '#223133', // A-5
  '#2B3233', // A-6
];

  renderCharts() {

    /* ===============================
      GRÁFICO DE BARRAS — FEOS
      =============================== */

    new Chart('barChart', {
      type: 'bar',
      data: {
        labels: this.feos.map(() => ''), // ❌ sin nombres
        datasets: [{
          data: this.feos.map(item => item.votos ?? 0),
          backgroundColor: this.feos.map(
            (_, i) => this.COLORES[i % this.COLORES.length]
          ),
          borderRadius: 8,
          barThickness: 'flex',
        }]
      },
      options: {
  responsive: true,
  maintainAspectRatio: false,

  onClick: (_evt, elements) => {
    if (!elements.length) return;

    const index = elements[0].index;
    const elemento = this.feos[index];

    if (elemento) {
      this.abrirModal(elemento);
    }
  },

  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => `Votos: ${ctx.raw}`
      }
    }
  },
  scales: {
    x: {
      display: false,
    },
    y: {
      ticks: {
        color: '#00BEDC',
        font: {
          size: 12,
        }
      },
      grid: {
        color: 'rgba(255,255,255,0.05)'
      }
    }
  }
}
    });

    /* ===============================
      GRÁFICO DE TORTA — LINDOS
      =============================== */

    new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: this.lindos.map(item => item.nombre),
        datasets: [{
          data: this.lindos.map(item => item.votos ?? 0),
          backgroundColor: this.lindos.map(
            (_, i) => this.COLORES[i % this.COLORES.length]
          ),
          borderWidth: 0,
        }]
      },
      options: {
  responsive: true,
  maintainAspectRatio: false,

  onClick: (_evt, elements) => {
    if (!elements.length) return;

    const index = elements[0].index;
    const elemento = this.lindos[index];

    if (elemento) {
      this.abrirModal(elemento);
    }
  },

  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx =>
          `${ctx.label}: ${ctx.raw} votos`
      }
    }
  }
}

    });
  }

  async abrirModal(elemento: Elemento) {
    const modal = await this.modalCtrl.create({
      component: FotoGraficoComponent,
      componentProps: {
        elemento
      },
      cssClass: 'modal-neon'
    });

    await modal.present();
  }

  async getElementos(): Promise<Elemento[]> {

    return await this.elemSvc.listarTodos();
  }
}