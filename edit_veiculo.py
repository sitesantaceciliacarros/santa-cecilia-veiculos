with open('veiculo.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

header = lines[:65]
footer = lines[448:]

# Edit header to include veiculo.css
for i, line in enumerate(header):
    if '<link rel="stylesheet" href="styles.css" />' in line:
        header.insert(i+1, '    <link rel="stylesheet" href="veiculo.css" />\n')
        break

# Edit footer to include veiculo.js instead of script.js
for i, line in enumerate(footer):
    if '<script src="script.js"></script>' in line:
        footer[i] = line.replace('script.js', 'veiculo.js')

body = """
    <!-- VEHICLE DETAILS MAIN -->
    <main class="vd-main">
      <div class="vd-gallery">
        <img id="detailImage" src="" alt="Veículo">
      </div>
      <div class="vd-container">
        <!-- LEFT COLUMN -->
        <div class="vd-left">
          <div class="vd-card">
            <div class="vd-header">
              <div>
                <h1 class="vd-title" id="detailName">-</h1>
                <div class="vd-trim" id="detailTrim">-</div>
              </div>
            </div>
            <div class="vd-specs-grid">
              <div class="vd-spec-item">
                <div class="vd-spec-label">Ano</div>
                <div class="vd-spec-value" id="detailYear">-</div>
              </div>
              <div class="vd-spec-item">
                <div class="vd-spec-label">KM</div>
                <div class="vd-spec-value" id="detailKm">-</div>
              </div>
              <div class="vd-spec-item">
                <div class="vd-spec-label">Combustível</div>
                <div class="vd-spec-value" id="detailFuel">-</div>
              </div>
              <div class="vd-spec-item">
                <div class="vd-spec-label">Câmbio</div>
                <div class="vd-spec-value" id="detailTrans">-</div>
              </div>
              <div class="vd-spec-item">
                <div class="vd-spec-label">Carroceria</div>
                <div class="vd-spec-value" id="detailType">-</div>
              </div>
            </div>
          </div>
          
          <div class="vd-card">
            <h3 class="vd-features-title">Características</h3>
            <div class="vd-features-list">
              <div class="vd-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Ar Condicionado
              </div>
              <div class="vd-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Direção Elétrica
              </div>
              <div class="vd-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Vidros Elétricos
              </div>
              <div class="vd-feature-item">
                <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                Multimídia com Carplay
              </div>
            </div>
          </div>
          
          <div class="vd-card">
            <h3 class="vd-features-title">Vendedor</h3>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 8px;"><strong>Santa Cecília Veículos</strong></p>
            <p style="color: rgba(255,255,255,0.7);">Av. Presidente Humberto de Alencar Castelo Branco, 2520 - Vila Leonor, Guarulhos - SP, 07040-030</p>
          </div>
        </div>
        
        <!-- RIGHT COLUMN -->
        <div class="vd-right">
          <div class="vd-price-box">
            <div class="vd-price-label">Preço à vista</div>
            <div class="vd-price-value" id="detailPrice">R$ -</div>
            <div class="vd-installment">ou <strong id="detailInstallment">-</strong></div>
            
            <form id="contactForm" onsubmit="event.preventDefault();">
              <div class="vd-form-group">
                <input type="text" placeholder="Nome Completo" required>
              </div>
              <div class="vd-form-group">
                <input type="email" placeholder="E-mail" required>
              </div>
              <div class="vd-form-group">
                <input type="tel" placeholder="Telefone / WhatsApp" required>
              </div>
              <button class="vd-btn vd-btn-primary" type="submit">Enviar Mensagem</button>
              <button class="vd-btn vd-btn-whatsapp" type="button">
                <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.66 0-3.203-.51-4.484-1.375l-.3-.188-3.091.918.918-3.091-.188-.3A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
                Falar no WhatsApp
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
"""

with open('veiculo.html', 'w', encoding='utf-8') as f:
    f.writelines(header)
    f.write(body)
    f.writelines(footer)
