import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ClientService } from '../../services/client.service';
import { Client } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm: string = '';

  // Unified Modal State: Registro / Edición
  showClientModal = false;
  editingClient: Client | null = null;
  clientForm = {
    name: '',
    email: '',
    phone: '',
    membership_type: 'basic',
    status: true as boolean
  };

  // Delete Confirmation State
  showDeleteConfirm = false;
  deletingClient: Client | null = null;

  // Face Registration Modal State
  showFaceScanModal = false;
  scanningClient: Client | null = null;
  @ViewChild('video') videoElement!: ElementRef;
  @ViewChild('canvas') canvasElement!: ElementRef;
  streaming = false;
  stream: MediaStream | null = null;
  isRegistering = false;
  registrationMessage = '';
  registrationSuccess = false;

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  loadClients() {
    this.clientService.getClients().subscribe(data => {
      this.clients = data;
      this.applyFilter();
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilter();
  }

  applyFilter() {
    if (!this.searchTerm) {
      this.filteredClients = [...this.clients];
    } else {
      this.filteredClients = this.clients.filter(client => 
        client.name.toLowerCase().includes(this.searchTerm) || 
        client.email.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  getClientMembershipType(client: Client): string {
    return client.membership_type || 'basic';
  }

  // --- Client Modal Controls ---
  openRegisterModal() {
    this.editingClient = null;
    this.resetForm();
    this.showClientModal = true;
  }

  openEditModal(client: Client) {
    this.editingClient = { ...client };
    this.clientForm = {
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      membership_type: client.membership_type,
      status: client.status
    };
    this.showClientModal = true;
  }

  closeClientModal() {
    this.showClientModal = false;
    this.editingClient = null;
    this.resetForm();
  }

  saveClient() {
    if (this.editingClient) {
      this.updateClient();
    } else {
      this.registerClient();
    }
  }

  registerClient() {
    if (!this.clientForm.email) {
      alert('Email es obligatorio');
      return;
    }

    this.clientService.createClient(this.clientForm).subscribe({
      next: (res) => {
        alert('Cliente registrado exitosamente');
        this.closeClientModal();
        this.loadClients();
      },
      error: (err) => {
        console.error(err);
        alert('Error al registrar cliente: ' + (err.error?.detail || err.message));
      }
    });
  }

  updateClient() {
    if (!this.editingClient) return;

    this.clientService.updateClient(this.editingClient.id, this.clientForm).subscribe({
      next: (res) => {
        alert('Cliente actualizado exitosamente');
        this.closeClientModal();
        this.loadClients();
      },
      error: (err) => {
        console.error(err);
        alert('Error actualizando cliente: ' + (err.error?.detail || err.message));
      }
    });
  }

  resetForm() {
    this.clientForm = {
      name: '',
      email: '',
      phone: '',
      membership_type: 'basic',
      status: true
    };
  }

  // --- Face Scan Controls ---
  openFaceScanModal(client: Client) {
    this.scanningClient = client;
    this.showFaceScanModal = true;
    setTimeout(() => {
      this.startCamera();
    }, 100);
  }

  closeFaceScanModal() {
    this.showFaceScanModal = false;
    this.scanningClient = null;
    this.isRegistering = false;
    this.registrationMessage = '';
    this.registrationSuccess = false;
    this.stopCamera();
    
    // Trigger change detection to update the UI
    this.cdr.detectChanges();
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
        this.streaming = true;
      }
    } catch (error) {
      console.error('Error accessing camera', error);
      alert('No se pudo acceder a la cámara. Por favor verifica los permisos.');
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.streaming = false;
    }
  }

  captureFace() {
    if (!this.scanningClient || !this.streaming || this.isRegistering) {
      return;
    }

    this.isRegistering = true;
    this.registrationMessage = 'Analizando biometría...';

    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob: Blob | null) => {
      if (!blob) {
        this.isRegistering = false;
        this.registrationMessage = 'Error capturando imagen';
        return;
      }

      const file = new File([blob], 'face_capture.jpg', { type: 'image/jpeg' });
      this.clientService.registerFace(this.scanningClient!.id, file).subscribe({
        next: (res) => {
          console.log('Registration response:', res); // Debug log
          this.registrationSuccess = true;
          this.registrationMessage = '¡Registro Exitoso!';
          this.isRegistering = false; // Stop the processing state
          
          // Trigger change detection to update the UI
          this.cdr.detectChanges();

          // Automatic close after 1.5s
          setTimeout(() => {
            console.log('Closing modal after success'); // Debug log
            this.closeFaceScanModal();
          }, 1500);
        },
        error: (err) => {
          console.error('Registration error:', err); // Debug log
          this.isRegistering = false;
          this.registrationSuccess = false; // Ensure success state is false for errors
          // Capture the specific error from backend (low confidence, etc)
          this.registrationMessage = (err.error?.detail || err.message || 'Error desconocido');
          
          // Trigger change detection to update the UI
          this.cdr.detectChanges();
        }
      });
    }, 'image/jpeg');
  }

  // --- Delete Controls ---
  confirmDelete(client: Client) {
    this.deletingClient = client;
    this.showDeleteConfirm = true;
  }

  closeDeleteConfirmation() {
    this.showDeleteConfirm = false;
    this.deletingClient = null;
  }

  deleteClient() {
    if (!this.deletingClient) return;

    this.clientService.deleteClient(this.deletingClient.id).subscribe({
      next: (res) => {
        alert('Cliente eliminado exitosamente');
        this.closeDeleteConfirmation();
        this.loadClients();
      },
      error: (err) => {
        console.error(err);
        alert('Error eliminando cliente: ' + (err.error?.detail || err.message));
      }
    });
  }
}
