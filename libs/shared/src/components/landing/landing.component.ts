import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'shared-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <div class="nav-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="nav-logo-svg">
              <path d="M2 13h3l2-4 3 8 2-6 2 2h5"/>
            </svg>
          </div>
          <span class="nav-title">PULSE</span>
        </div>
        <div class="nav-actions">
          <a [routerLink]="loginUrl" class="btn btn-ghost">Iniciar Sesión</a>
          <a [routerLink]="registerUrl" class="btn btn-primary">Registrarse</a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-badge">Plataforma de Gestión Gym</div>
          <h1 class="hero-title">
            Gestiona tu gimnasio
            <span class="hero-highlight">de forma inteligente</span>
          </h1>
          <p class="hero-subtitle">
            La plataforma completa para administrar socios, rutinas, asistencia y pagos. 
            Optimiza la operación de tu gimnasio y mejora la experiencia de tus clientes.
          </p>
          <div class="hero-cta">
            <a [routerLink]="registerUrl" class="btn btn-primary btn-lg">
              Comenzar Ahora
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <button class="btn btn-outline btn-lg" (click)="scrollToFeatures()">
              Conocer Más
            </button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card">
            <div class="hero-card-header">
              <div class="hero-card-dot green"></div>
              <div class="hero-card-dot yellow"></div>
              <div class="hero-card-dot red"></div>
            </div>
            <div class="hero-card-content">
              <div class="hero-card-row">
                <div class="hero-card-avatar"></div>
                <div class="hero-card-text">
                  <div class="hero-card-line long"></div>
                  <div class="hero-card-line short"></div>
                </div>
              </div>
              <div class="hero-card-chart">
                <div class="chart-bar" style="height: 40%"></div>
                <div class="chart-bar" style="height: 60%"></div>
                <div class="chart-bar" style="height: 45%"></div>
                <div class="chart-bar" style="height: 80%"></div>
                <div class="chart-bar" style="height: 65%"></div>
                <div class="chart-bar" style="height: 90%"></div>
                <div class="chart-bar" style="height: 75%"></div>
              </div>
              <div class="hero-card-row">
                <div class="hero-card-text">
                  <div class="hero-card-line medium"></div>
                  <div class="hero-card-line short"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
      <div class="features-container">
        <div class="section-header">
          <h2 class="section-title">Todo lo que necesitas en un solo lugar</h2>
          <p class="section-subtitle">
            Herramientas poderosas diseñadas para simplificar la gestión de tu gimnasio
          </p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Gestión de Socios</h3>
            <p>Administra perfiles, membresías y pagos de todos tus socios de forma centralizada y eficiente.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <h3>Rutinas Personalizadas</h3>
            <p>Crea y asigna planes de entrenamiento personalizados para cada socio según sus objetivos.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>Control de Asistencia</h3>
            <p>Registra y monitorea la asistencia de tus socios con estadísticas detalladas en tiempo real.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>Pagos y Facturación</h3>
            <p>Gestiona membresías, cobros automáticos y genera reportes financieros integrados con MercadoPago.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon red">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
            </div>
            <h3>Métricas e Inteligencia</h3>
            <p>Visualiza dashboards con KPIs clave: retención, ingresos, asistencia y crecimiento del negocio.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon teal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Seguro y Confiable</h3>
            <p>Datos encriptados y respaldo automático. Tu información y la de tus socios siempre está protegida.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works">
      <div class="how-container">
        <div class="section-header">
          <h2 class="section-title">¿Cómo funciona?</h2>
          <p class="section-subtitle">
            Comienza a gestionar tu gimnasio en 3 simples pasos
          </p>
        </div>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <div class="step-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h3>Crea tu Cuenta</h3>
            <p>Regístrate gratis en menos de 2 minutos. Solo necesitás tu email y los datos de tu gimnasio.</p>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <div class="step-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h3>Configura tu Gimnasio</h3>
            <p>Agrega tus instalaciones, Define tus planes de membresía y personaliza las opciones de tu espacio.</p>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <div class="step-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>Comienza a Operar</h3>
            <p>Agrega tus primeros socios, asigna rutinas y empezá a controlar la asistencia del día a día.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="benefits">
      <div class="benefits-container">
        <div class="benefits-content">
          <div class="section-header left">
            <h2 class="section-title">¿Por qué elegir PULSE?</h2>
            <p class="section-subtitle">
              Herramientas diseñadas por expertos del sector fitness para hacer crecer tu negocio
            </p>
          </div>
          <div class="benefits-list">
            <div class="benefit-item">
              <div class="benefit-check">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="benefit-text">
                <h4>Sin costos ocultos</h4>
                <p>Plan simple y transparente. Pagiá solo por lo que necesitás.</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-check">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="benefit-text">
                <h4>Soporte en español</h4>
                <p>Equipo de soporte disponible para ayudarte cuando lo necesites.</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-check">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="benefit-text">
                <h4>Actualizaciones constantes</h4>
                <p>Nuevas funcionalidades y mejoras basadas en feedback real de nuestros usuarios.</p>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-check">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div class="benefit-text">
                <h4>Integración con MercadoPago</h4>
                <p>Cobrá las membresías de forma automática y segura con el medio de pago más usado de Latinoamérica.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-container">
        <h2 class="cta-title">¿Listo para transformar tu gimnasio?</h2>
        <p class="cta-subtitle">
          Comenzá a gestionar tu gimnasio de forma inteligente con PULSE.
        </p>
        <a [routerLink]="registerUrl" class="btn btn-primary btn-lg cta-button">
          Empezar Gratis Ahora
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="footer-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="footer-logo-svg">
              <path d="M2 13h3l2-4 3 8 2-6 2 2h5"/>
            </svg>
          </div>
          <span class="footer-title">PULSE</span>
          <p class="footer-desc">
            La plataforma de gestión integral para gimnasios modernos.
          </p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>Producto</h4>
            <a [routerLink]="loginUrl">Funcionalidades</a>
            <a [routerLink]="loginUrl">Precios</a>
            <a [routerLink]="loginUrl">Demo</a>
          </div>
          <div class="footer-col">
            <h4>Soporte</h4>
            <a [routerLink]="loginUrl">Centro de Ayuda</a>
            <a [routerLink]="loginUrl">Contacto</a>
            <a [routerLink]="loginUrl">Estado del Sistema</a>
          </div>
          <div class="footer-col">
            <h4>Legal</h4>
            <a [routerLink]="loginUrl">Privacidad</a>
            <a [routerLink]="loginUrl">Términos</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 PULSE. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* Navbar */
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--app-border);
      z-index: 1000;
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .nav-logo {
      width: 40px;
      height: 40px;
      background: var(--app-primary);
      color: var(--app-on-primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
    }
    .nav-logo-svg {
      width: 22px;
      height: 22px;
      color: #1a2e05;
    }
    .nav-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
      letter-spacing: -0.02em;
    }
    .nav-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    /* Hero Section */
    .hero {
      padding: 8rem 1.5rem 5rem;
      background:
        radial-gradient(60rem 40rem at 110% -10%, var(--lime-100) 0%, transparent 55%),
        radial-gradient(50rem 35rem at -20% 110%, var(--lime-50) 0%, transparent 55%),
        var(--app-bg);
    }
    .hero-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 3rem;
      align-items: center;
    }
    @media (min-width: 900px) {
      .hero-container {
        grid-template-columns: 1fr 1fr;
      }
    }
    .hero-content {
      text-align: center;
    }
    @media (min-width: 900px) {
      .hero-content {
        text-align: left;
      }
    }
    .hero-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: var(--app-primary-soft);
      color: var(--lime-700);
      border: 1px solid var(--app-primary-soft-border);
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: var(--text-main);
      margin: 0 0 1.5rem;
    }
    @media (min-width: 900px) {
      .hero-title {
        font-size: 3.25rem;
      }
    }
    .hero-highlight {
      display: block;
      background: linear-gradient(135deg, var(--lime-600) 0%, var(--lime-500) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-subtitle {
      font-size: 1.1rem;
      color: var(--text-muted);
      line-height: 1.7;
      margin: 0 0 2rem;
      max-width: 520px;
    }
    @media (min-width: 900px) {
      .hero-subtitle {
        margin-left: 0;
      }
    }
    .hero-subtitle {
      margin-left: auto;
      margin-right: auto;
    }
    @media (min-width: 900px) {
      .hero-subtitle {
        margin-left: 0;
        margin-right: 0;
      }
    }
    .hero-cta {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 3rem;
    }
    @media (min-width: 900px) {
      .hero-cta {
        justify-content: flex-start;
      }
    }

    /* Hero Visual */
    .hero-visual {
      display: none;
    }
    @media (min-width: 900px) {
      .hero-visual {
        display: flex;
        justify-content: center;
      }
    }
    .hero-card {
      width: 100%;
      max-width: 400px;
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
    }
    .hero-card-header {
      display: flex;
      gap: 0.5rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--app-border);
    }
    .hero-card-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .hero-card-dot.green { background: #22c55e; }
    .hero-card-dot.yellow { background: #eab308; }
    .hero-card-dot.red { background: #ef4444; }
    .hero-card-content {
      padding: 1.5rem;
    }
    .hero-card-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .hero-card-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--lime-400) 0%, var(--lime-600) 100%);
    }
    .hero-card-text {
      flex: 1;
    }
    .hero-card-line {
      height: 10px;
      border-radius: 5px;
      background: var(--slate-100);
      margin-bottom: 0.5rem;
    }
    .hero-card-line.long { width: 80%; }
    .hero-card-line.medium { width: 60%; }
    .hero-card-line.short { width: 40%; height: 8px; margin-bottom: 0; }
    .hero-card-chart {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      height: 100px;
      padding: 1rem 0;
      margin-bottom: 1.5rem;
    }
    .chart-bar {
      flex: 1;
      background: linear-gradient(180deg, var(--lime-400) 0%, var(--lime-600) 100%);
      border-radius: 6px 6px 0 0;
      min-height: 20px;
    }

    /* Features Section */
    .features {
      padding: 6rem 1.5rem;
      background: var(--app-bg);
    }
    .features-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }
    .section-header.left {
      text-align: left;
    }
    .section-title {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-main);
      margin: 0 0 1rem;
    }
    .section-subtitle {
      font-size: 1.1rem;
      color: var(--text-muted);
      margin: 0;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    .section-header.left .section-subtitle {
      margin-left: 0;
      margin-right: 0;
    }
    .features-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    @media (min-width: 768px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 1024px) {
      .features-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .feature-card {
      background: var(--app-surface);
      border: 1px solid var(--app-border);
      border-radius: var(--radius-lg);
      padding: 2rem;
      transition: all 0.2s ease;
    }
    .feature-card:hover {
      border-color: var(--app-primary);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .feature-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    .feature-icon.blue {
      background: #eff6ff;
      color: #3b82f6;
    }
    .feature-icon.green {
      background: #f0fdf4;
      color: #22c55e;
    }
    .feature-icon.purple {
      background: #faf5ff;
      color: #a855f7;
    }
    .feature-icon.orange {
      background: #fff7ed;
      color: #f97316;
    }
    .feature-icon.red {
      background: #fef2f2;
      color: #ef4444;
    }
    .feature-icon.teal {
      background: #f0fdfa;
      color: #14b8a6;
    }
    .feature-card h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 0.75rem;
    }
    .feature-card p {
      font-size: 0.95rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0;
    }

    /* How It Works Section */
    .how-it-works {
      padding: 6rem 1.5rem;
      background: var(--slate-50);
    }
    .how-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .steps-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    @media (min-width: 768px) {
      .steps-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .step-card {
      text-align: center;
      padding: 2rem 1.5rem;
      background: var(--app-surface);
      border-radius: var(--radius-xl);
      border: 1px solid var(--app-border);
      position: relative;
    }
    .step-number {
      position: absolute;
      top: -16px;
      left: 50%;
      transform: translateX(-50%);
      width: 32px;
      height: 32px;
      background: var(--app-primary);
      color: var(--app-on-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.9rem;
      box-shadow: var(--shadow-sm);
    }
    .step-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1.25rem;
      background: var(--app-primary-soft);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--lime-600);
    }
    .step-card h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 0.75rem;
    }
    .step-card p {
      font-size: 0.95rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0;
    }

    /* Benefits Section */
    .benefits {
      padding: 6rem 1.5rem;
      background: var(--app-bg);
    }
    .benefits-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 4rem;
      align-items: center;
    }
    @media (min-width: 900px) {
      .benefits-container {
        grid-template-columns: 1fr 1fr;
      }
    }
    .benefits-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .benefit-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }
    .benefit-check {
      width: 28px;
      height: 28px;
      min-width: 28px;
      background: var(--success-bg);
      color: var(--success);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--success-border);
    }
    .benefit-text h4 {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 0.25rem;
    }
    .benefit-text p {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin: 0;
      line-height: 1.5;
    }

    /* CTA Section */
    .cta-section {
      padding: 5rem 1.5rem;
      background: linear-gradient(135deg, var(--lime-600) 0%, var(--lime-500) 100%);
    }
    .cta-container {
      max-width: 700px;
      margin: 0 auto;
      text-align: center;
    }
    .cta-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--app-on-primary);
      margin: 0 0 1rem;
      letter-spacing: -0.02em;
    }
    .cta-subtitle {
      font-size: 1.1rem;
      color: rgba(26, 46, 5, 0.8);
      margin: 0 0 2rem;
      line-height: 1.6;
    }
    .cta-button {
      background: var(--app-on-primary);
      color: var(--app-surface);
      border-color: var(--app-on-primary);
      font-size: 1.05rem;
      padding: 0.9rem 2rem;
    }
    .cta-button:hover {
      background: #0f1d02;
      border-color: #0f1d02;
      box-shadow: var(--shadow-lg);
      text-decoration: none;
    }

    /* Footer */
    .footer {
      padding: 4rem 1.5rem 2rem;
      background: var(--slate-900);
      color: var(--slate-300);
    }
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .footer-brand {
      margin-bottom: 2.5rem;
    }
    .footer-logo {
      width: 40px;
      height: 40px;
      background: var(--app-primary);
      color: var(--app-on-primary);
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
    }
    .footer-logo-svg {
      width: 22px;
      height: 22px;
      color: #1a2e05;
    }
    .footer-title {
      display: block;
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--slate-50);
      margin-bottom: 0.5rem;
    }
    .footer-desc {
      font-size: 0.95rem;
      color: var(--slate-400);
      margin: 0;
      max-width: 300px;
    }
    .footer-links {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
      margin-bottom: 3rem;
    }
    @media (min-width: 768px) {
      .footer-links {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .footer-col h4 {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--slate-200);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 1rem;
    }
    .footer-col a {
      display: block;
      font-size: 0.9rem;
      color: var(--slate-400);
      text-decoration: none;
      margin-bottom: 0.75rem;
      transition: color 0.15s;
    }
    .footer-col a:hover {
      color: var(--lime-400);
      text-decoration: none;
    }
    .footer-bottom {
      border-top: 1px solid var(--slate-700);
      padding-top: 2rem;
    }
    .footer-bottom p {
      font-size: 0.85rem;
      color: var(--slate-500);
      margin: 0;
    }
  `]
})
export class SharedLandingComponent {
  @Input() appType: 'admin' | 'member' = 'member';

  get loginUrl(): string {
    return this.appType === 'admin' ? '/login' : '/login';
  }

  get registerUrl(): string {
    return this.appType === 'admin' ? '/login' : '/register';
  }

  scrollToFeatures(): void {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}