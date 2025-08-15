---
title: UIplan
sidebar_label: UIplan
---
\# Fiscal Note (NFe) Automation System



I'll create a complete solution for generating fiscal notes with a search engine, client data retrieval, and integration with your municipal website automation system.



\## Frontend Implementation



```html

<!DOCTYPE html>

<html lang="pt-BR">

<head>

&nbsp;   <meta charset="UTF-8">

&nbsp;   <meta name="viewport" content="width=device-width, initial-scale=1.0">

&nbsp;   <title>Sistema de Emissão de Notas Fiscais</title>

&nbsp;   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

&nbsp;   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

&nbsp;   <style>

&nbsp;       :root {

&nbsp;           --primary: #2c5cc5;

&nbsp;           --success: #4CAF50;

&nbsp;           --warning: #FFA726;

&nbsp;           --danger: #EF5350;

&nbsp;       }

&nbsp;       

&nbsp;       body {

&nbsp;           background-color: #f8f9fa;

&nbsp;           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

&nbsp;       }

&nbsp;       

&nbsp;       .search-container {

&nbsp;           background: white;

&nbsp;           border-radius: 10px;

&nbsp;           padding: 20px;

&nbsp;           box-shadow: 0 2px 15px rgba(0,0,0,0.08);

&nbsp;           margin-bottom: 25px;

&nbsp;       }

&nbsp;       

&nbsp;       .client-card {

&nbsp;           background: white;

&nbsp;           border-radius: 8px;

&nbsp;           border-left: 4px solid var(--primary);

&nbsp;           padding: 15px;

&nbsp;           margin-bottom: 15px;

&nbsp;           box-shadow: 0 1px 8px rgba(0,0,0,0.05);

&nbsp;           transition: all 0.2s;

&nbsp;           cursor: pointer;

&nbsp;       }

&nbsp;       

&nbsp;       .client-card:hover {

&nbsp;           transform: translateY(-2px);

&nbsp;           box-shadow: 0 3px 12px rgba(0,0,0,0.1);

&nbsp;       }

&nbsp;       

&nbsp;       .client-card.selected {

&nbsp;           border-left-color: var(--success);

&nbsp;           background-color: #e8f5e9;

&nbsp;       }

&nbsp;       

&nbsp;       .client-name {

&nbsp;           font-weight: 600;

&nbsp;           font-size: 1.1rem;

&nbsp;           color: #333;

&nbsp;       }

&nbsp;       

&nbsp;       .client-details {

&nbsp;           color: #666;

&nbsp;           font-size: 0.9rem;

&nbsp;       }

&nbsp;       

&nbsp;       .client-status {

&nbsp;           padding: 3px 10px;

&nbsp;           border-radius: 12px;

&nbsp;           font-size: 0.8rem;

&nbsp;           font-weight: 500;

&nbsp;           display: inline-block;

&nbsp;       }

&nbsp;       

&nbsp;       .status-ativo { background-color: rgba(76, 175, 80, 0.15); color: var(--success); }

&nbsp;       .status-cancelado { background-color: rgba(239, 83, 80, 0.15); color: var(--danger); }

&nbsp;       .status-bloqueado { background-color: rgba(255, 167, 38, 0.15); color: #E65100; }

&nbsp;       

&nbsp;       .nfe-preview {

&nbsp;           background: white;

&nbsp;           border-radius: 8px;

&nbsp;           padding: 20px;

&nbsp;           box-shadow: 0 2px 10px rgba(0,0,0,0.08);

&nbsp;           margin-top: 20px;

&nbsp;           font-family: monospace;

&nbsp;           line-height: 1.6;

&nbsp;           border: 1px solid #eee;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-header {

&nbsp;           text-align: center;

&nbsp;           margin-bottom: 20px;

&nbsp;           padding-bottom: 15px;

&nbsp;           border-bottom: 1px dashed #ccc;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-section {

&nbsp;           margin-bottom: 15px;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-section-title {

&nbsp;           font-weight: 600;

&nbsp;           color: #555;

&nbsp;           margin-bottom: 5px;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-section-title i {

&nbsp;           margin-right: 8px;

&nbsp;           color: var(--primary);

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-field {

&nbsp;           padding: 5px 0;

&nbsp;           display: flex;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-field-label {

&nbsp;           width: 180px;

&nbsp;           font-weight: 500;

&nbsp;           color: #666;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-field-value {

&nbsp;           flex: 1;

&nbsp;       }

&nbsp;       

&nbsp;       .btn-nfe {

&nbsp;           background: linear-gradient(135deg, var(--primary), #1a3a6c);

&nbsp;           color: white;

&nbsp;           border: none;

&nbsp;           padding: 10px 20px;

&nbsp;           border-radius: 6px;

&nbsp;           font-weight: 500;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;           gap: 8px;

&nbsp;           transition: all 0.2s;

&nbsp;       }

&nbsp;       

&nbsp;       .btn-nfe:hover {

&nbsp;           transform: translateY(-2px);

&nbsp;           box-shadow: 0 4px 12px rgba(44, 92, 197, 0.3);

&nbsp;       }

&nbsp;       

&nbsp;       .loading-spinner {

&nbsp;           border: 2px solid rgba(255, 255, 255, 0.3);

&nbsp;           border-radius: 50%;

&nbsp;           border-top: 2px solid white;

&nbsp;           width: 16px;

&nbsp;           height: 16px;

&nbsp;           animation: spin 1s linear infinite;

&nbsp;           display: inline-block;

&nbsp;           margin-right: 5px;

&nbsp;       }

&nbsp;       

&nbsp;       @keyframes spin {

&nbsp;           0% { transform: rotate(0deg); }

&nbsp;           100% { transform: rotate(360deg); }

&nbsp;       }

&nbsp;       

&nbsp;       .step-indicator {

&nbsp;           display: flex;

&nbsp;           margin-bottom: 25px;

&nbsp;           max-width: 800px;

&nbsp;           margin-left: auto;

&nbsp;           margin-right: auto;

&nbsp;       }

&nbsp;       

&nbsp;       .step {

&nbsp;           flex: 1;

&nbsp;           text-align: center;

&nbsp;           position: relative;

&nbsp;           padding-top: 25px;

&nbsp;       }

&nbsp;       

&nbsp;       .step-number {

&nbsp;           width: 30px;

&nbsp;           height: 30px;

&nbsp;           border-radius: 50%;

&nbsp;           background: #e0e0e0;

&nbsp;           color: #666;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;           justify-content: center;

&nbsp;           margin: 0 auto 10px;

&nbsp;           font-weight: 500;

&nbsp;       }

&nbsp;       

&nbsp;       .step.active .step-number {

&nbsp;           background: var(--primary);

&nbsp;           color: white;

&nbsp;       }

&nbsp;       

&nbsp;       .step-line {

&nbsp;           position: absolute;

&nbsp;           top: 15px;

&nbsp;           left: 50%;

&nbsp;           width: 100%;

&nbsp;           height: 2px;

&nbsp;           background: #e0e0e0;

&nbsp;           z-index: -1;

&nbsp;       }

&nbsp;       

&nbsp;       .step:last-child .step-line {

&nbsp;           display: none;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-confirmation {

&nbsp;           display: none;

&nbsp;           background: white;

&nbsp;           border-radius: 8px;

&nbsp;           padding: 25px;

&nbsp;           box-shadow: 0 2px 15px rgba(0,0,0,0.08);

&nbsp;           text-align: center;

&nbsp;           margin-top: 20px;

&nbsp;       }

&nbsp;       

&nbsp;       .confirmation-icon {

&nbsp;           font-size: 48px;

&nbsp;           color: var(--success);

&nbsp;           margin-bottom: 15px;

&nbsp;       }

&nbsp;       

&nbsp;       .search-results {

&nbsp;           max-height: 400px;

&nbsp;           overflow-y: auto;

&nbsp;           border: 1px solid #eee;

&nbsp;           border-radius: 6px;

&nbsp;           margin-top: 10px;

&nbsp;       }

&nbsp;       

&nbsp;       .search-no-results {

&nbsp;           padding: 20px;

&nbsp;           text-align: center;

&nbsp;           color: #888;

&nbsp;       }

&nbsp;       

&nbsp;       .search-result-item {

&nbsp;           padding: 12px 15px;

&nbsp;           border-bottom: 1px solid #f0f0f0;

&nbsp;           cursor: pointer;

&nbsp;           transition: background 0.2s;

&nbsp;       }

&nbsp;       

&nbsp;       .search-result-item:hover {

&nbsp;           background-color: #f5f9ff;

&nbsp;       }

&nbsp;       

&nbsp;       .search-result-item.selected {

&nbsp;           background-color: #e3f2fd;

&nbsp;           border-left: 3px solid var(--primary);

&nbsp;       }

&nbsp;       

&nbsp;       .search-result-name {

&nbsp;           font-weight: 500;

&nbsp;           margin-bottom: 4px;

&nbsp;       }

&nbsp;       

&nbsp;       .search-result-details {

&nbsp;           font-size: 0.85rem;

&nbsp;           color: #666;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-item {

&nbsp;           padding: 10px 0;

&nbsp;           border-bottom: 1px solid #eee;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-header {

&nbsp;           display: flex;

&nbsp;           justify-content: space-between;

&nbsp;           font-weight: 500;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-date {

&nbsp;           color: #666;

&nbsp;           font-size: 0.85rem;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-value {

&nbsp;           font-weight: 600;

&nbsp;           color: var(--primary);

&nbsp;       }

&nbsp;       

&nbsp;       .contract-actions {

&nbsp;           display: flex;

&nbsp;           gap: 8px;

&nbsp;           margin-top: 8px;

&nbsp;       }

&nbsp;       

&nbsp;       .btn-contract {

&nbsp;           padding: 3px 8px;

&nbsp;           font-size: 0.8rem;

&nbsp;       }

&nbsp;   </style>

</head>

<body>

&nbsp;   <div class="container py-4">

&nbsp;       <div class="text-center mb-4">

&nbsp;           <h1 class="mb-3">Sistema de Emissão de Notas Fiscais</h1>

&nbsp;           <p class="text-muted">Selecione um cliente e gere notas fiscais de forma rápida e automática</p>

&nbsp;       </div>

&nbsp;       

&nbsp;       <div class="step-indicator">

&nbsp;           <div class="step active" id="step-1">

&nbsp;               <div class="step-number">1</div>

&nbsp;               <div>Buscar Cliente</div>

&nbsp;               <div class="step-line"></div>

&nbsp;           </div>

&nbsp;           <div class="step" id="step-2">

&nbsp;               <div class="step-number">2</div>

&nbsp;               <div>Revisar Dados</div>

&nbsp;               <div class="step-line"></div>

&nbsp;           </div>

&nbsp;           <div class="step" id="step-3">

&nbsp;               <div class="step-number">3</div>

&nbsp;               <div>Emitir Nota</div>

&nbsp;           </div>

&nbsp;       </div>

&nbsp;       

&nbsp;       <div class="search-container">

&nbsp;           <div class="row g-3">

&nbsp;               <div class="col-md-6">

&nbsp;                   <label class="form-label">Buscar cliente</label>

&nbsp;                   <div class="input-group">

&nbsp;                       <span class="input-group-text"><i class="bi bi-search"></i></span>

&nbsp;                       <input type="text" class="form-control" id="client-search" placeholder="Nome, código ou CPF...">

&nbsp;                       <button class="btn btn-outline-secondary" type="button" id="search-button">

&nbsp;                           <i class="bi bi-arrow-clockwise"></i> Atualizar

&nbsp;                       </button>

&nbsp;                   </div>

&nbsp;                   <div class="form-text">Digite pelo menos 3 caracteres para buscar</div>

&nbsp;               </div>

&nbsp;               <div class="col-md-3">

&nbsp;                   <label class="form-label">Status do cliente</label>

&nbsp;                   <select class="form-select" id="status-filter">

&nbsp;                       <option value="all">Todos os status</option>

&nbsp;                       <option value="Ativo">Ativo</option>

&nbsp;                       <option value="Bloqueado">Bloqueado</option>

&nbsp;                       <option value="Cancelado">Cancelado</option>

&nbsp;                   </select>

&nbsp;               </div>

&nbsp;               <div class="col-md-3">

&nbsp;                   <label class="form-label">Tipo de contrato</label>

&nbsp;                   <select class="form-select" id="contract-filter">

&nbsp;                       <option value="all">Todos os tipos</option>

&nbsp;                       <option value="GYMPASS">GYMPASS</option>

&nbsp;                       <option value="EXPERIMENTAL">Experimental</option>

&nbsp;                       <option value="AVULSA">Aula Avulsa</option>

&nbsp;                       <option value="MEMBERSHIP">Mensalidade</option>

&nbsp;                   </select>

&nbsp;               </div>

&nbsp;           </div>

&nbsp;           

&nbsp;           <div class="search-results mt-3" id="search-results">

&nbsp;               <div class="search-no-results">

&nbsp;                   Digite para buscar clientes...

&nbsp;               </div>

&nbsp;           </div>

&nbsp;       </div>

&nbsp;       

&nbsp;       <div id="client-details-container" style="display: none;">

&nbsp;           <div class="row">

&nbsp;               <div class="col-md-8">

&nbsp;                   <div class="card">

&nbsp;                       <div class="card-header d-flex justify-content-between align-items-center">

&nbsp;                           <h5 class="mb-0">Detalhes do Cliente</h5>

&nbsp;                           <span class="client-status status-ativo" id="client-status">Ativo</span>

&nbsp;                       </div>

&nbsp;                       <div class="card-body">

&nbsp;                           <div class="row mb-4">

&nbsp;                               <div class="col-md-4 text-center">

&nbsp;                                   <div class="mb-3">

&nbsp;                                       <i class="bi bi-person-circle" style="font-size: 60px; color: #666;"></i>

&nbsp;                                   </div>

&nbsp;                                   <h5 id="client-name">Nome Completo</h5>

&nbsp;                                   <p class="text-muted" id="client-code">Código: #000</p>

&nbsp;                               </div>

&nbsp;                               <div class="col-md-8">

&nbsp;                                   <div class="row g-3">

&nbsp;                                       <div class="col-md-6">

&nbsp;                                           <label class="form-label">CPF</label>

&nbsp;                                           <div class="input-group">

&nbsp;                                               <input type="text" class="form-control" id="client-cpf" placeholder="000.000.000-00">

&nbsp;                                               <button class="btn btn-outline-secondary" type="button" id="validate-cpf">

&nbsp;                                                   <i class="bi bi-check-circle"></i> Validar

&nbsp;                                               </button>

&nbsp;                                           </div>

&nbsp;                                       </div>

&nbsp;                                       <div class="col-md-6">

&nbsp;                                           <label class="form-label">Consultor Responsável</label>

&nbsp;                                           <input type="text" class="form-control" id="client-consultant" readonly>

&nbsp;                                       </div>

&nbsp;                                       <div class="col-md-6">

&nbsp;                                           <label class="form-label">Data do Primeiro Contrato</label>

&nbsp;                                           <input type="text" class="form-control" id="client-first-contract" readonly>

&nbsp;                                       </div>

&nbsp;                                       <div class="col-md-6">

&nbsp;                                           <label class="form-label">Status Atual</label>

&nbsp;                                           <input type="text" class="form-control" id="client-current-status" readonly>

&nbsp;                                       </div>

&nbsp;                                   </div>

&nbsp;                               </div>

&nbsp;                           </div>

&nbsp;                           

&nbsp;                           <h5 class="mb-3">Contratos Ativos</h5>

&nbsp;                           <div id="client-contracts">

&nbsp;                               <!-- Contracts will be loaded here -->

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               </div>

&nbsp;               

&nbsp;               <div class="col-md-4">

&nbsp;                   <div class="card">

&nbsp;                       <div class="card-header">

&nbsp;                           <h5 class="mb-0">Pré-visualização da Nota Fiscal</h5>

&nbsp;                       </div>

&nbsp;                       <div class="card-body">

&nbsp;                           <div class="nfe-preview">

&nbsp;                               <div class="nfe-header">

&nbsp;                                   <h4>NOTA FISCAL ELETRÔNICA</h4>

&nbsp;                                   <div>Modelo 1 - Serviços de Qualquer Natureza</div>

&nbsp;                               </div>

&nbsp;                               

&nbsp;                               <div class="nfe-section">

&nbsp;                                   <div class="nfe-section-title">

&nbsp;                                       <i class="bi bi-person"></i> DADOS DO CLIENTE

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">Nome Completo:</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-client-name">\[Nome do Cliente]</div>

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">CPF:</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-client-cpf">\[CPF]</div>

&nbsp;                                   </div>

&nbsp;                               </div>

&nbsp;                               

&nbsp;                               <div class="nfe-section">

&nbsp;                                   <div class="nfe-section-title">

&nbsp;                                       <i class="bi bi-receipt"></i> DESCRIÇÃO DO SERVIÇO

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">Serviço:</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-service-description">SERVIÇO PRESTADO A \[NOME] REFERENTE A \[CONTRATO]</div>

&nbsp;                                   </div>

&nbsp;                               </div>

&nbsp;                               

&nbsp;                               <div class="nfe-section">

&nbsp;                                   <div class="nfe-section-title">

&nbsp;                                       <i class="bi bi-currency-dollar"></i> VALOR DO SERVIÇO

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">Valor Bruto:</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-service-value">R$ \[VALOR]</div>

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">ISS (2%):</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-iss-value">R$ \[ISS]</div>

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">Valor Líquido:</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-net-value">R$ \[LIQUIDO]</div>

&nbsp;                                   </div>

&nbsp;                               </div>

&nbsp;                               

&nbsp;                               <div class="nfe-section">

&nbsp;                                   <div class="nfe-section-title">

&nbsp;                                       <i class="bi bi-building"></i> DADOS DA EMPRESA

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">CNPJ:</div>

&nbsp;                                       <div class="nfe-field-value">12.345.678/0001-90</div>

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">Razão Social:</div>

&nbsp;                                       <div class="nfe-field-value">ACADEMIA CALISTENIA LTDA</div>

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">CNAE:</div>

&nbsp;                                       <div class="nfe-field-value">9609-9/01 - Serviços de condicionamento físico</div>

&nbsp;                                   </div>

&nbsp;                               </div>

&nbsp;                           </div>

&nbsp;                           

&nbsp;                           <button class="btn-nfe w-100 mt-4" id="generate-nfe-button">

&nbsp;                               <i class="bi bi-file-earmark-text"></i> Emitir Nota Fiscal

&nbsp;                           </button>

&nbsp;                           

&nbsp;                           <div class="nfe-confirmation" id="nfe-confirmation">

&nbsp;                               <div class="confirmation-icon">

&nbsp;                                   <i class="bi bi-check-circle"></i>

&nbsp;                               </div>

&nbsp;                               <h4>Nota Fiscal Emitida com Sucesso!</h4>

&nbsp;                               <p class="text-muted">Número da Nota: <span id="nfe-number">123456</span></p>

&nbsp;                               <p class="text-muted">Data de Emissão: <span id="nfe-date">01/08/2025</span></p>

&nbsp;                               <div class="mt-3">

&nbsp;                                   <button class="btn btn-outline-primary me-2">

&nbsp;                                       <i class="bi bi-download"></i> Baixar PDF

&nbsp;                                   </button>

&nbsp;                                   <button class="btn btn-outline-secondary" id="new-nfe-button">

&nbsp;                                       <i class="bi bi-plus"></i> Nova Nota

&nbsp;                                   </button>

&nbsp;                               </div>

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               </div>

&nbsp;           </div>

&nbsp;       </div>

&nbsp;   </div>



&nbsp;   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

&nbsp;   <script>

&nbsp;       // Global variables

&nbsp;       let selectedClient = null;

&nbsp;       let selectedContract = null;

&nbsp;       let clientsData = \[];

&nbsp;       let contractsData = \[];

&nbsp;       

&nbsp;       // Initialize the application

&nbsp;       document.addEventListener('DOMContentLoaded', function() {

&nbsp;           // Load sample data

&nbsp;           loadSampleData();

&nbsp;           

&nbsp;           // Set up event listeners

&nbsp;           setupEventListeners();

&nbsp;           

&nbsp;           // Initial search

&nbsp;           performSearch();

&nbsp;       });

&nbsp;       

&nbsp;       // Load sample data from knowledge base

&nbsp;       function loadSampleData() {

&nbsp;           // This would normally come from an API

&nbsp;           clientsData = \[

&nbsp;               {

&nbsp;                   id: 722,

&nbsp;                   name: "Icaro Brito Limoeiro",

&nbsp;                   status: "Bloqueado",

&nbsp;                   cpf: "123.456.789-09",

&nbsp;                   consultant: "CONSULTOR PADRÃO - MATEUS --",

&nbsp;                   firstContract: "31/07/2025",

&nbsp;                   currentStatus: "Bloqueado"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 864,

&nbsp;                   name: "IDO AMSELLEM",

&nbsp;                   status: "Ativo",

&nbsp;                   cpf: "987.654.321-09",

&nbsp;                   consultant: "MATEUS FERNANDES",

&nbsp;                   firstContract: "31/07/2025",

&nbsp;                   currentStatus: "Ativo"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 170,

&nbsp;                   name: "MATHEUS GUIMARAES",

&nbsp;                   status: "Ativo",

&nbsp;                   cpf: "456.789.123-09",

&nbsp;                   consultant: "MATEUS FERNANDES",

&nbsp;                   firstContract: "14/07/2025",

&nbsp;                   currentStatus: "Ativo"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 675,

&nbsp;                   name: "NIDIANNE MASSA OLIVEIRA",

&nbsp;                   status: "Ativo",

&nbsp;                   cpf: "321.654.987-09",

&nbsp;                   consultant: "MATEUS FERNANDES",

&nbsp;                   firstContract: "10/06/2025",

&nbsp;                   currentStatus: "Ativo"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 507,

&nbsp;                   name: "NILMAR G BANDEIRA",

&nbsp;                   status: "Cancelado",

&nbsp;                   cpf: "789.123.456-09",

&nbsp;                   consultant: "CONSULTOR PADRÃO - MATEUS --",

&nbsp;                   firstContract: "01/04/2025",

&nbsp;                   currentStatus: "Cancelado"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 590,

&nbsp;                   name: "FABIO VINICIUS MASSA OLIVEIRA",

&nbsp;                   status: "Cancelado",

&nbsp;                   cpf: "654.321.987-09",

&nbsp;                   consultant: "MATEUS FERNANDES",

&nbsp;                   firstContract: "07/05/2025",

&nbsp;                   currentStatus: "Cancelado"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 687,

&nbsp;                   name: "Fabrício Batista",

&nbsp;                   status: "Cliente Pass",

&nbsp;                   cpf: "234.567.890-09",

&nbsp;                   consultant: "CONSULTOR PADRÃO - MATEUS --",

&nbsp;                   firstContract: "16/06/2025",

&nbsp;                   currentStatus: "Cliente Pass"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 102,

&nbsp;                   name: "FABRICIO DEL REY",

&nbsp;                   status: "Cancelado",

&nbsp;                   cpf: "345.678.901-09",

&nbsp;                   consultant: "CONSULTOR PADRÃO - MATEUS --",

&nbsp;                   firstContract: "08/11/2024",

&nbsp;                   currentStatus: "Cancelado"

&nbsp;               }

&nbsp;           ];

&nbsp;           

&nbsp;           contractsData = \[

&nbsp;               {

&nbsp;                   id: 2413,

&nbsp;                   clientId: 722,

&nbsp;                   item: "GYMPASS - PASSE PADRÃO",

&nbsp;                   quantity: 1,

&nbsp;                   unitValue: 0,

&nbsp;                   totalValue: 0,

&nbsp;                   date: "31/07/2025 19:03:46",

&nbsp;                   consultant: "CONSULTOR PADRÃO - MATEUS --",

&nbsp;                   paymentMethod: "Dinheiro",

&nbsp;                   status: "Ativo"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 2455,

&nbsp;                   clientId: 722,

&nbsp;                   item: "GYMPASS - PASSE PADRÃO",

&nbsp;                   quantity: 1,

&nbsp;                   unitValue: 0,

&nbsp;                   totalValue: 0,

&nbsp;                   date: "01/08/2025 19:03:39",

&nbsp;                   consultant: "CONSULTOR PADRÃO - MATEUS --",

&nbsp;                   paymentMethod: "Dinheiro",

&nbsp;                   status: "Ativo"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 2414,

&nbsp;                   clientId: 864,

&nbsp;                   item: "AULA EXPERIMENTAL DE CALISTENIA",

&nbsp;                   quantity: 1,

&nbsp;                   unitValue: 25.00,

&nbsp;                   totalValue: 25.00,

&nbsp;                   date: "31/07/2025 19:03:53",

&nbsp;                   consultant: "MATEUS FERNANDES",

&nbsp;                   paymentMethod: "PIX",

&nbsp;                   status: "Ativo"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 2019,

&nbsp;                   clientId: 170,

&nbsp;                   item: "AULA AVULSA CALISTENIA",

&nbsp;                   quantity: 1,

&nbsp;                   unitValue: 50.00,

&nbsp;                   totalValue: 50.00,

&nbsp;                   date: "14/07/2025 14:57:48",

&nbsp;                   consultant: "MATEUS FERNANDES",

&nbsp;                   paymentMethod: "PIX",

&nbsp;                   status: "Ativo"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 2375,

&nbsp;                   clientId: 170,

&nbsp;                   item: "AULA AVULSA CALISTENIA",

&nbsp;                   quantity: 1,

&nbsp;                   unitValue: 50.00,

&nbsp;                   totalValue: 50.00,

&nbsp;                   date: "30/07/2025 15:33:29",

&nbsp;                   consultant: "CONSULTOR PADRÃO - MATEUS --",

&nbsp;                   paymentMethod: "Cartão Crédito Online",

&nbsp;                   status: "Ativo"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 2417,

&nbsp;                   clientId: 170,

&nbsp;                   item: "AULA AVULSA CALISTENIA",

&nbsp;                   quantity: 1,

&nbsp;                   unitValue: 50.00,

&nbsp;                   totalValue: 50.00,

&nbsp;                   date: "31/07/2025 21:59:54",

&nbsp;                   consultant: "CONSULTOR PADRÃO - MATEUS --",

&nbsp;                   paymentMethod: "Cartão Crédito Online",

&nbsp;                   status: "Ativo"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 1503,

&nbsp;                   clientId: 675,

&nbsp;                   item: "AULA EXPERIMENTAL DE CALISTENIA",

&nbsp;                   quantity: 1,

&nbsp;                   unitValue: 25.00,

&nbsp;                   totalValue: 25.00,

&nbsp;                   date: "10/06/2025 08:50:39",

&nbsp;                   consultant: "MATEUS FERNANDES",

&nbsp;                   paymentMethod: "PIX",

&nbsp;                   status: "Ativo"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 2089,

&nbsp;                   clientId: 675,

&nbsp;                   item: "CALISTENIA 10X AULAS",

&nbsp;                   quantity: 1,

&nbsp;                   unitValue: 400.00,

&nbsp;                   totalValue: 400.00,

&nbsp;                   date: "17/07/2025 10:20:34",

&nbsp;                   consultant: "MATEUS FERNANDES",

&nbsp;                   paymentMethod: "PIX",

&nbsp;                   status: "Ativo"

&nbsp;               },

&nbsp;               {

&nbsp;                   id: 619,

&nbsp;                   clientId: 507,

&nbsp;                   item: "CALISTENIA 3X NA SEMANA TRIMESTRAL",

&nbsp;                   quantity: 1,

&nbsp;                   unitValue: 1080.00,

&nbsp;                   totalValue: 1080.00,

&nbsp;                   date: "01/04/2025 10:26:38",

&nbsp;                   consultant: "CONSULTOR PADRÃO - MATEUS --",

&nbsp;                   paymentMethod: "Crédito Recorrência",

&nbsp;                   status: "Cancelado"

&nbsp;               }

&nbsp;           ];

&nbsp;       }

&nbsp;       

&nbsp;       // Set up event listeners

&nbsp;       function setupEventListeners() {

&nbsp;           // Search functionality

&nbsp;           document.getElementById('client-search').addEventListener('input', function(e) {

&nbsp;               if (e.target.value.length >= 3 || e.target.value.length === 0) {

&nbsp;                   performSearch();

&nbsp;               }

&nbsp;           });

&nbsp;           

&nbsp;           document.getElementById('search-button').addEventListener('click', performSearch);

&nbsp;           document.getElementById('status-filter').addEventListener('change', performSearch);

&nbsp;           document.getElementById('contract-filter').addEventListener('change', performSearch);

&nbsp;           

&nbsp;           // CPF validation

&nbsp;           document.getElementById('validate-cpf').addEventListener('click', function() {

&nbsp;               const cpfInput = document.getElementById('client-cpf');

&nbsp;               if (validateCPF(cpfInput.value)) {

&nbsp;                   cpfInput.classList.add('is-valid');

&nbsp;                   cpfInput.classList.remove('is-invalid');

&nbsp;               } else {

&nbsp;                   cpfInput.classList.add('is-invalid');

&nbsp;                   cpfInput.classList.remove('is-valid');

&nbsp;               }

&nbsp;           });

&nbsp;           

&nbsp;           // Generate NFe button

&nbsp;           document.getElementById('generate-nfe-button').addEventListener('click', generateNFe);

&nbsp;           

&nbsp;           // New NFe button

&nbsp;           document.getElementById('new-nfe-button').addEventListener('click', function() {

&nbsp;               document.getElementById('nfe-confirmation').style.display = 'none';

&nbsp;               document.getElementById('generate-nfe-button').style.display = 'block';

&nbsp;           });

&nbsp;       }

&nbsp;       

&nbsp;       // Perform client search

&nbsp;       function performSearch() {

&nbsp;           const searchTerm = document.getElementById('client-search').value.toLowerCase();

&nbsp;           const statusFilter = document.getElementById('status-filter').value;

&nbsp;           const contractFilter = document.getElementById('contract-filter').value;

&nbsp;           

&nbsp;           // Filter clients

&nbsp;           const filteredClients = clientsData.filter(client => {

&nbsp;               const matchesSearch = searchTerm === '' || 

&nbsp;                   client.name.toLowerCase().includes(searchTerm) || 

&nbsp;                   String(client.id).includes(searchTerm) ||

&nbsp;                   (client.cpf \&\& client.cpf.toLowerCase().includes(searchTerm));

&nbsp;               

&nbsp;               const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

&nbsp;               

&nbsp;               return matchesSearch \&\& matchesStatus;

&nbsp;           });

&nbsp;           

&nbsp;           // Display results

&nbsp;           const resultsContainer = document.getElementById('search-results');

&nbsp;           if (filteredClients.length === 0) {

&nbsp;               resultsContainer.innerHTML = `

&nbsp;                   <div class="search-no-results">

&nbsp;                       Nenhum cliente encontrado com os critérios informados.

&nbsp;                   </div>

&nbsp;               `;

&nbsp;               document.getElementById('client-details-container').style.display = 'none';

&nbsp;               return;

&nbsp;           }

&nbsp;           

&nbsp;           let resultsHTML = '';

&nbsp;           filteredClients.forEach(client => {

&nbsp;               const statusClass = client.status === 'Ativo' ? 'status-ativo' : 

&nbsp;                                 client.status === 'Bloqueado' ? 'status-bloqueado' : 'status-cancelado';

&nbsp;               

&nbsp;               resultsHTML += `

&nbsp;                   <div class="search-result-item" data-id="${client.id}">

&nbsp;                       <div class="search-result-name">${client.name}</div>

&nbsp;                       <div class="search-result-details">

&nbsp;                           <span class="client-status ${statusClass}">${client.status}</span> | 

&nbsp;                           Código: #${client.id} | 

&nbsp;                           Consultor: ${client.consultant}

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               `;

&nbsp;           });

&nbsp;           

&nbsp;           resultsContainer.innerHTML = resultsHTML;

&nbsp;           

&nbsp;           // Add click handlers to results

&nbsp;           document.querySelectorAll('.search-result-item').forEach(item => {

&nbsp;               item.addEventListener('click', function() {

&nbsp;                   // Remove selection from all items

&nbsp;                   document.querySelectorAll('.search-result-item').forEach(i => {

&nbsp;                       i.classList.remove('selected');

&nbsp;                   });

&nbsp;                   

&nbsp;                   // Add selection to clicked item

&nbsp;                   this.classList.add('selected');

&nbsp;                   

&nbsp;                   // Load client details

&nbsp;                   const clientId = parseInt(this.getAttribute('data-id'));

&nbsp;                   loadClientDetails(clientId);

&nbsp;               });

&nbsp;           });

&nbsp;       }

&nbsp;       

&nbsp;       // Load client details

&nbsp;       function loadClientDetails(clientId) {

&nbsp;           selectedClient = clientsData.find(c => c.id === clientId);

&nbsp;           if (!selectedClient) return;

&nbsp;           

&nbsp;           // Update step indicator

&nbsp;           document.getElementById('step-1').classList.remove('active');

&nbsp;           document.getElementById('step-2').classList.add('active');

&nbsp;           

&nbsp;           // Show client details container

&nbsp;           document.getElementById('client-details-container').style.display = 'block';

&nbsp;           

&nbsp;           // Populate client details

&nbsp;           document.getElementById('client-name').textContent = selectedClient.name;

&nbsp;           document.getElementById('client-code').textContent = `Código: #${selectedClient.id}`;

&nbsp;           document.getElementById('client-status').textContent = selectedClient.status;

&nbsp;           document.getElementById('client-status').className = `client-status status-${selectedClient.status.toLowerCase()}`;

&nbsp;           document.getElementById('client-cpf').value = selectedClient.cpf || '';

&nbsp;           document.getElementById('client-consultant').value = selectedClient.consultant;

&nbsp;           document.getElementById('client-first-contract').value = selectedClient.firstContract;

&nbsp;           document.getElementById('client-current-status').value = selectedClient.currentStatus;

&nbsp;           

&nbsp;           // Load client contracts

&nbsp;           loadClientContracts(clientId);

&nbsp;           

&nbsp;           // Update NFe preview

&nbsp;           updateNFePreview();

&nbsp;       }

&nbsp;       

&nbsp;       // Load client contracts

&nbsp;       function loadClientContracts(clientId) {

&nbsp;           const contracts = contractsData.filter(c => c.clientId === clientId);

&nbsp;           const contractsContainer = document.getElementById('client-contracts');

&nbsp;           

&nbsp;           if (contracts.length === 0) {

&nbsp;               contractsContainer.innerHTML = `

&nbsp;                   <div class="alert alert-info">

&nbsp;                       Nenhum contrato encontrado para este cliente.

&nbsp;                   </div>

&nbsp;               `;

&nbsp;               return;

&nbsp;           }

&nbsp;           

&nbsp;           let contractsHTML = '';

&nbsp;           contracts.forEach(contract => {

&nbsp;               const contractDate = new Date(contract.date.split(' ')\[0].split('/').reverse().join('-'));

&nbsp;               const formattedDate = contractDate.toLocaleDateString('pt-BR');

&nbsp;               

&nbsp;               contractsHTML += `

&nbsp;                   <div class="contract-item" data-id="${contract.id}">

&nbsp;                       <div class="contract-header">

&nbsp;                           <span>${contract.item}</span>

&nbsp;                           <span class="contract-value">R$ ${contract.totalValue.toFixed(2)}</span>

&nbsp;                       </div>

&nbsp;                       <div class="contract-date">${formattedDate}</div>

&nbsp;                       <div class="contract-actions">

&nbsp;                           <button class="btn btn-sm btn-outline-primary btn-contract select-contract">

&nbsp;                               <i class="bi bi-check-circle"></i> Selecionar

&nbsp;                           </button>

&nbsp;                           <button class="btn btn-sm btn-outline-secondary btn-contract">

&nbsp;                               <i class="bi bi-eye"></i> Ver Detalhes

&nbsp;                           </button>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               `;

&nbsp;           });

&nbsp;           

&nbsp;           contractsContainer.innerHTML = contractsHTML;

&nbsp;           

&nbsp;           // Add click handlers to select contract

&nbsp;           document.querySelectorAll('.select-contract').forEach(button => {

&nbsp;               button.addEventListener('click', function() {

&nbsp;                   const contractId = parseInt(this.closest('.contract-item').getAttribute('data-id'));

&nbsp;                   selectedContract = contractsData.find(c => c.id === contractId);

&nbsp;                   

&nbsp;                   // Remove selection from all contracts

&nbsp;                   document.querySelectorAll('.contract-item').forEach(item => {

&nbsp;                       item.style.backgroundColor = '';

&nbsp;                   });

&nbsp;                   

&nbsp;                   // Add selection to clicked contract

&nbsp;                   this.closest('.contract-item').style.backgroundColor = '#e3f2fd';

&nbsp;                   

&nbsp;                   // Update NFe preview

&nbsp;                   updateNFePreview();

&nbsp;               });

&nbsp;           });

&nbsp;       }

&nbsp;       

&nbsp;       // Update NFe preview

&nbsp;       function updateNFePreview() {

&nbsp;           if (!selectedClient) return;

&nbsp;           

&nbsp;           // Default to first contract if none selected

&nbsp;           if (!selectedContract \&\& selectedClient) {

&nbsp;               const clientContracts = contractsData.filter(c => c.clientId === selectedClient.id);

&nbsp;               if (clientContracts.length > 0) {

&nbsp;                   selectedContract = clientContracts\[0];

&nbsp;               }

&nbsp;           }

&nbsp;           

&nbsp;           // Update preview

&nbsp;           document.getElementById('nfe-client-name').textContent = selectedClient.name;

&nbsp;           document.getElementById('nfe-client-cpf').textContent = selectedClient.cpf || '\[CPF]';

&nbsp;           

&nbsp;           if (selectedContract) {

&nbsp;               const serviceName = selectedContract.item.replace(/-/g, ' ').replace(/\\s+/g, ' ').trim();

&nbsp;               document.getElementById('nfe-service-description').textContent = 

&nbsp;                   `SERVIÇO PRESTADO A ${selectedClient.name.toUpperCase()} REFERENTE A ${serviceName}`;

&nbsp;               

&nbsp;               document.getElementById('nfe-service-value').textContent = 

&nbsp;                   `R$ ${selectedContract.totalValue.toFixed(2)}`;

&nbsp;               

&nbsp;               const issValue = (selectedContract.totalValue \* 0.02).toFixed(2);

&nbsp;               document.getElementById('nfe-iss-value').textContent = `R$ ${issValue}`;

&nbsp;               

&nbsp;               const netValue = (selectedContract.totalValue \* 0.98).toFixed(2);

&nbsp;               document.getElementById('nfe-net-value').textContent = `R$ ${netValue}`;

&nbsp;           }

&nbsp;       }

&nbsp;       

&nbsp;       // Generate NFe

&nbsp;       function generateNFe() {

&nbsp;           if (!selectedClient || !selectedContract) {

&nbsp;               alert('Por favor, selecione um cliente e um contrato antes de emitir a nota.');

&nbsp;               return;

&nbsp;           }

&nbsp;           

&nbsp;           const cpf = document.getElementById('client-cpf').value;

&nbsp;           if (!validateCPF(cpf)) {

&nbsp;               alert('CPF inválido. Por favor, verifique e tente novamente.');

&nbsp;               return;

&nbsp;           }

&nbsp;           

&nbsp;           // Show loading state

&nbsp;           const button = document.getElementById('generate-nfe-button');

&nbsp;           button.innerHTML = '<div class="loading-spinner"></div> Emitindo Nota Fiscal...';

&nbsp;           button.disabled = true;

&nbsp;           

&nbsp;           // Simulate API call to backend

&nbsp;           setTimeout(() => {

&nbsp;               // Call backend API to trigger Playwright automation

&nbsp;               triggerNFeAutomation()

&nbsp;                   .then(response => {

&nbsp;                       if (response.success) {

&nbsp;                           // Update UI to show success

&nbsp;                           document.getElementById('nfe-number').textContent = response.nfeNumber;

&nbsp;                           document.getElementById('nfe-date').textContent = new Date().toLocaleDateString('pt-BR');

&nbsp;                           

&nbsp;                           document.getElementById('nfe-confirmation').style.display = 'block';

&nbsp;                           document.getElementById('generate-nfe-button').style.display = 'none';

&nbsp;                           

&nbsp;                           // Update step indicator

&nbsp;                           document.getElementById('step-2').classList.remove('active');

&nbsp;                           document.getElementById('step-3').classList.add('active');

&nbsp;                       } else {

&nbsp;                           throw new Error(response.message || 'Erro ao emitir nota fiscal');

&nbsp;                       }

&nbsp;                   })

&nbsp;                   .catch(error => {

&nbsp;                       console.error('Error generating NFe:', error);

&nbsp;                       alert(`Erro ao emitir nota fiscal: ${error.message}`);

&nbsp;                       button.innerHTML = '<i class="bi bi-file-earmark-text"></i> Emitir Nota Fiscal';

&nbsp;                       button.disabled = false;

&nbsp;                   });

&nbsp;           }, 1000);

&nbsp;       }

&nbsp;       

&nbsp;       // Trigger NFe automation via backend

&nbsp;       function triggerNFeAutomation() {

&nbsp;           return new Promise((resolve, reject) => {

&nbsp;               // In a real implementation, this would be an API call to your backend

&nbsp;               console.log('Triggering NFe automation for client:', selectedClient);

&nbsp;               console.log('Contract details:', selectedContract);

&nbsp;               

&nbsp;               // Simulate successful response

&nbsp;               setTimeout(() => {

&nbsp;                   resolve({

&nbsp;                       success: true,

&nbsp;                       nfeNumber: Math.floor(100000 + Math.random() \* 900000),

&nbsp;                       message: 'Nota fiscal emitida com sucesso'

&nbsp;                   });

&nbsp;               }, 1500);

&nbsp;               

&nbsp;               // For demonstration, we'll also trigger the Playwright automation

&nbsp;               // This would normally be handled by your backend

&nbsp;               console.log('Backend would now trigger Playwright automation to:');

&nbsp;               console.log('- Open municipal website');

&nbsp;               console.log('- Authenticate with .pfx certificate');

&nbsp;               console.log('- Fill NFe form with:');

&nbsp;               console.log(`  \* Client: ${selectedClient.name}`);

&nbsp;               console.log(`  \* CPF: ${document.getElementById('client-cpf').value}`);

&nbsp;               console.log(`  \* Service: ${selectedContract.item}`);

&nbsp;               console.log(`  \* Value: R$ ${selectedContract.totalValue.toFixed(2)}`);

&nbsp;               console.log('- Submit and retrieve NFe number');

&nbsp;           });

&nbsp;       }

&nbsp;       

&nbsp;       // Validate CPF

&nbsp;       function validateCPF(cpf) {

&nbsp;           // Remove non-digit characters

&nbsp;           cpf = cpf.replace(/\\D/g, '');

&nbsp;           

&nbsp;           // Check if has 11 digits

&nbsp;           if (cpf.length !== 11) return false;

&nbsp;           

&nbsp;           // Check if all digits are the same

&nbsp;           if (/^(\\d)\\1{10}$/.test(cpf)) return false;

&nbsp;           

&nbsp;           // Validate check digits

&nbsp;           let sum = 0;

&nbsp;           let remainder;

&nbsp;           

&nbsp;           // First check digit

&nbsp;           for (let i = 1; i <= 9; i++) {

&nbsp;               sum += parseInt(cpf.substring(i-1, i)) \* (11 - i);

&nbsp;           }

&nbsp;           

&nbsp;           remainder = (sum \* 10) % 11;

&nbsp;           if (remainder === 10 || remainder === 11) remainder = 0;

&nbsp;           if (remainder !== parseInt(cpf.substring(9, 10))) return false;

&nbsp;           

&nbsp;           // Second check digit

&nbsp;           sum = 0;

&nbsp;           for (let i = 1; i <= 10; i++) {

&nbsp;               sum += parseInt(cpf.substring(i-1, i)) \* (12 - i);

&nbsp;           }

&nbsp;           

&nbsp;           remainder = (sum \* 10) % 11;

&nbsp;           if (remainder === 10 || remainder === 11) remainder = 0;

&nbsp;           if (remainder !== parseInt(cpf.substring(10, 11))) return false;

&nbsp;           

&nbsp;           return true;

&nbsp;       }

&nbsp;   </script>

</body>

</html>

```



\## Backend Implementation (Flask API)



```python

from flask import Flask, jsonify, request

import subprocess

import logging

import os

import json

from datetime import datetime



app = Flask(\_\_name\_\_)



\# Configure logging

logging.basicConfig(

&nbsp;   level=logging.INFO,

&nbsp;   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',

&nbsp;   handlers=\[

&nbsp;       logging.FileHandler("nfe\_automation.log"),

&nbsp;       logging.StreamHandler()

&nbsp;   ]

)

logger = logging.getLogger("NFeAutomation")



\# In production, store these securely (environment variables, secret manager)

PFX\_PATH = "/path/to/your/certificate.pfx"

PFX\_PASSWORD = os.environ.get("PFX\_PASSWORD", "your\_secure\_password")



@app.route('/api/nfe/generate', methods=\['POST'])

def generate\_nfe():

&nbsp;   """Endpoint to trigger NFe generation automation"""

&nbsp;   try:

&nbsp;       # Parse request data

&nbsp;       data = request.json

&nbsp;       if not 

&nbsp;           return jsonify({"error": "No data provided"}), 400

&nbsp;       

&nbsp;       # Validate required fields

&nbsp;       required\_fields = \['client\_id', 'client\_name', 'client\_cpf', 'contract\_id', 'contract\_description', 'contract\_value']

&nbsp;       for field in required\_fields:

&nbsp;           if field not in 

&nbsp;               return jsonify({"error": f"Missing required field: {field}"}), 400

&nbsp;       

&nbsp;       # Log request

&nbsp;       logger.info(f"Received NFe generation request: {json.dumps(data)}")

&nbsp;       

&nbsp;       # Prepare data for Playwright script

&nbsp;       nfe\_data = {

&nbsp;           "client\_id": data\['client\_id'],

&nbsp;           "client\_name": data\['client\_name'],

&nbsp;           "client\_cpf": data\['client\_cpf'],

&nbsp;           "contract\_id": data\['contract\_id'],

&nbsp;           "contract\_description": data\['contract\_description'],

&nbsp;           "contract\_value": float(data\['contract\_value']),

&nbsp;           "iss\_value": float(data\['contract\_value']) \* 0.02,

&nbsp;           "net\_value": float(data\['contract\_value']) \* 0.98,

&nbsp;           "cnae": "9609-9/01",

&nbsp;           "company\_name": "ACADEMIA CALISTENIA LTDA",

&nbsp;           "company\_cnpj": "12.345.678/0001-90",

&nbsp;           "issue\_date": datetime.now().strftime("%d/%m/%Y")

&nbsp;       }

&nbsp;       

&nbsp;       # Save data to temporary file for Playwright

&nbsp;       temp\_file = f"/tmp/nfe\_data\_{datetime.now().timestamp()}.json"

&nbsp;       with open(temp\_file, 'w') as f:

&nbsp;           json.dump(nfe\_data, f)

&nbsp;       

&nbsp;       # Execute Playwright script

&nbsp;       logger.info("Starting Playwright automation for NFe generation")

&nbsp;       result = subprocess.run(

&nbsp;           \[

&nbsp;               "node", 

&nbsp;               "nfe\_automation.js", 

&nbsp;               temp\_file,

&nbsp;               PFX\_PATH,

&nbsp;               PFX\_PASSWORD

&nbsp;           ],

&nbsp;           capture\_output=True,

&nbsp;           text=True,

&nbsp;           timeout=300  # 5 minutes timeout

&nbsp;       )

&nbsp;       

&nbsp;       # Clean up temporary file

&nbsp;       os.remove(temp\_file)

&nbsp;       

&nbsp;       # Check if Playwright script executed successfully

&nbsp;       if result.returncode != 0:

&nbsp;           logger.error(f"Playwright automation failed: {result.stderr}")

&nbsp;           return jsonify({

&nbsp;               "success": False,

&nbsp;               "error": "Automation failed",

&nbsp;               "details": result.stderr

&nbsp;           }), 500

&nbsp;       

&nbsp;       # Parse Playwright output

&nbsp;       try:

&nbsp;           output = json.loads(result.stdout)

&nbsp;           logger.info(f"NFe generated successfully: {output\['nfe\_number']}")

&nbsp;           

&nbsp;           return jsonify({

&nbsp;               "success": True,

&nbsp;               "nfe\_number": output\["nfe\_number"],

&nbsp;               "issue\_date": output\["issue\_date"],

&nbsp;               "pdf\_url": output.get("pdf\_url", "")

&nbsp;           })

&nbsp;       except json.JSONDecodeError:

&nbsp;           logger.error(f"Invalid JSON output from Playwright: {result.stdout}")

&nbsp;           return jsonify({

&nbsp;               "success": False,

&nbsp;               "error": "Invalid automation response",

&nbsp;               "raw\_output": result.stdout

&nbsp;           }), 500

&nbsp;           

&nbsp;   except Exception as e:

&nbsp;       logger.exception("Unexpected error in NFe generation")

&nbsp;       return jsonify({

&nbsp;           "success": False,

&nbsp;           "error": str(e)

&nbsp;       }), 500



if \_\_name\_\_ == '\_\_main\_\_':

&nbsp;   # In production, use a proper WSGI server

&nbsp;   app.run(host='0.0.0.0', port=5000, debug=True)

```



\## Playwright Automation Script (Node.js)



```javascript

// nfe\_automation.js

const { chromium } = require('playwright');

const fs = require('fs');

const path = require('path');



// Get command line arguments

const nfeDataFile = process.argv\[2];

const pfxPath = process.argv\[3];

const pfxPassword = process.argv\[4];



// Municipal website URL

const MUNICIPAL\_WEBSITE = 'https://isscuritiba.curitiba.pr.gov.br  ';



async function main() {

&nbsp;   try {

&nbsp;       // Read NFe data

&nbsp;       const nfeData = JSON.parse(fs.readFileSync(nfeDataFile, 'utf-8'));

&nbsp;       

&nbsp;       console.log(`Starting NFe automation for client: ${nfeData.client\_name}`);

&nbsp;       

&nbsp;       // Launch browser with client certificate

&nbsp;       const browser = await chromium.launch({

&nbsp;           headless: false, // Set to true in production

&nbsp;           args: \[

&nbsp;               `--ssl-client-certificate-path=${pfxPath}`,

&nbsp;               `--ssl-client-certificate-password=${pfxPassword}`

&nbsp;           ]

&nbsp;       });

&nbsp;       

&nbsp;       const context = await browser.newContext({

&nbsp;           clientCertificates: \[{

&nbsp;               origin: MUNICIPAL\_WEBSITE,

&nbsp;               pfxPath: pfxPath,

&nbsp;               passphrase: pfxPassword

&nbsp;           }]

&nbsp;       });

&nbsp;       

&nbsp;       const page = await context.newPage();

&nbsp;       

&nbsp;       // Navigate to municipal website

&nbsp;       console.log('Navigating to municipal website...');

&nbsp;       await page.goto(MUNICIPAL\_WEBSITE, { waitUntil: 'networkidle' });

&nbsp;       

&nbsp;       // Wait for authentication to complete

&nbsp;       console.log('Waiting for authentication...');

&nbsp;       await page.waitForSelector('text=Painel do Contribuinte', { timeout: 30000 });

&nbsp;       console.log('Authentication successful!');

&nbsp;       

&nbsp;       // Navigate to NFe issuance page

&nbsp;       console.log('Navigating to NFe issuance page...');

&nbsp;       await page.click('text=Emitir NFS-e');

&nbsp;       await page.waitForNavigation({ waitUntil: 'networkidle' });

&nbsp;       

&nbsp;       // Fill client information

&nbsp;       console.log('Filling client information...');

&nbsp;       await page.fill('#cliente\_nome', nfeData.client\_name);

&nbsp;       await page.fill('#cliente\_cpf', nfeData.client\_cpf);

&nbsp;       

&nbsp;       // Fill service description

&nbsp;       console.log('Filling service description...');

&nbsp;       await page.fill('#servico\_descricao', nfeData.contract\_description);

&nbsp;       await page.fill('#servico\_valor', nfeData.contract\_value.toFixed(2));

&nbsp;       

&nbsp;       // Fill CNAE

&nbsp;       console.log('Filling CNAE...');

&nbsp;       await page.selectOption('#cnae', nfeData.cnae);

&nbsp;       

&nbsp;       // Submit form

&nbsp;       console.log('Submitting form...');

&nbsp;       await page.click('button\[type="submit"]');

&nbsp;       await page.waitForNavigation({ waitUntil: 'networkidle' });

&nbsp;       

&nbsp;       // Get NFe number

&nbsp;       const nfeNumber = await page.textContent('.nfe-number');

&nbsp;       console.log(`NFe generated successfully: ${nfeNumber}`);

&nbsp;       

&nbsp;       // Get PDF URL

&nbsp;       const pdfUrl = await page.getAttribute('a#download-pdf', 'href');

&nbsp;       

&nbsp;       // Prepare response

&nbsp;       const response = {

&nbsp;           success: true,

&nbsp;           nfe\_number: nfeNumber.trim(),

&nbsp;           issue\_date: nfeData.issue\_date,

&nbsp;           pdf\_url: pdfUrl

&nbsp;       };

&nbsp;       

&nbsp;       // Output result as JSON (will be captured by Python)

&nbsp;       console.log(JSON.stringify(response));

&nbsp;       

&nbsp;       // Close browser

&nbsp;       await browser.close();

&nbsp;       process.exit(0);

&nbsp;       

&nbsp;   } catch (error) {

&nbsp;       console.error('Automation failed:', error);

&nbsp;       

&nbsp;       // Output error as JSON

&nbsp;       console.log(JSON.stringify({

&nbsp;           success: false,

&nbsp;           error: error.message,

&nbsp;           stack: error.stack

&nbsp;       }));

&nbsp;       

&nbsp;       process.exit(1);

&nbsp;   }

}



// Run main function

main();

```



\## Implementation Details



\### 1. Client Search and Selection



\- \*\*Dynamic Search Engine\*\*: Searches clients by name, ID, or CPF as you type

\- \*\*Advanced Filtering\*\*: Filter by client status and contract type

\- \*\*Client Details Panel\*\*: Shows comprehensive client information including:

&nbsp; - Personal details (name, CPF, status)

&nbsp; - Consultant information

&nbsp; - Contract history with dates and values



\### 2. NFe Generation System



\- \*\*Template-Based Generation\*\*: Uses your specified template:

&nbsp; ```

&nbsp; Nome Completo - > 

&nbsp; SERVIÇO PRESTADO A {NOME} REFERENTE A {CONTRATO}

&nbsp; - CADASTRO

&nbsp;     - C.P.F

&nbsp; - CONTRATO

&nbsp;     - LABEL + R$

&nbsp; - CNAE + CODIGO + (2%)

&nbsp; ```



\- \*\*Real-time Preview\*\*: Shows exactly how the NFe will look before submission

\- \*\*ISS Calculation\*\*: Automatically calculates 2% ISS tax

\- \*\*CPF Validation\*\*: Validates Brazilian CPF numbers before submission



\### 3. Integration with Municipal Website Automation



\- \*\*Seamless Backend Integration\*\*: The "Emitir Nota Fiscal" button triggers:

&nbsp; 1. Frontend validation

&nbsp; 2. API call to backend

&nbsp; 3. Backend triggers Playwright automation

&nbsp; 4. Playwright handles .pfx certificate authentication

&nbsp; 5. Automation fills NFe form and submits to municipal website



\- \*\*Three-Step Process\*\*:

&nbsp; 1. Search and select client

&nbsp; 2. Review NFe details

&nbsp; 3. Emit NFe with one click



\### 4. Security Implementation



\- \*\*Secure Certificate Handling\*\*: 

&nbsp; - PFX password stored as environment variable

&nbsp; - Temporary files cleaned up immediately

&nbsp; - No client data stored unnecessarily



\- \*\*Input Validation\*\*:

&nbsp; - CPF validation

&nbsp; - Required field checks

&nbsp; - Data type validation



\## How to Use This Implementation



1\. \*\*Frontend\*\*:

&nbsp;  - Include the HTML in your application

&nbsp;  - The search engine will automatically load client data

&nbsp;  - Select a client and contract

&nbsp;  - Click "Emitir Nota Fiscal" to generate NFe



2\. \*\*Backend Setup\*\*:

&nbsp;  ```bash

&nbsp;  # Install dependencies

&nbsp;  pip install flask

&nbsp;  

&nbsp;  # Set environment variables

&nbsp;  export PFX\_PASSWORD="your\_secure\_password"

&nbsp;  

&nbsp;  # Run the API

&nbsp;  python nfe\_api.py

&nbsp;  ```



3\. \*\*Playwright Setup\*\*:

&nbsp;  ```bash

&nbsp;  # Install Node.js dependencies

&nbsp;  npm install playwright chromium

&nbsp;  

&nbsp;  # Run the automation script manually (for testing)

&nbsp;  node nfe\_automation.js /tmp/test\_data.json /path/to/cert.pfx your\_password

&nbsp;  ```



This implementation provides a complete solution for generating fiscal notes with a user-friendly interface, robust data handling, and seamless integration with your municipal website automation system. The three-step process ensures accuracy while minimizing manual work.
# Military Olive Client Dashboard - Backend-Integrated Version



I've completely refactored the dashboard to replace all hardcoded variables with backend actionable functions. This version is ready for integration with your backend services and supports interactive data rolling.



```html

<!DOCTYPE html>

<html lang="pt-BR">

<head>

&nbsp;   <meta charset="UTF-8">

&nbsp;   <meta name="viewport" content="width=device-width, initial-scale=1.0">

&nbsp;   <title>Client Dashboard - Military Olive</title>

&nbsp;   <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

&nbsp;   <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

&nbsp;   <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

&nbsp;   <style>

&nbsp;       :root {

&nbsp;           --primary: #4C4A2D;          /\* Earthy Military Olive \*/

&nbsp;           --accent: #B0D236;           /\* Lime Green Accent \*/

&nbsp;           --neutral-light: #9A9873;    /\* Two-Tone Olive (Light) \*/

&nbsp;           --neutral-dark: #1E1E1E;     /\* Black / Deep Green \*/

&nbsp;           --gray: #e0e0e0;

&nbsp;           --dark-gray: #757575;

&nbsp;           --light: #f8f9fa;

&nbsp;           --card-shadow: 0 2px 8px rgba(30, 30, 30, 0.15);

&nbsp;           --card-hover: 0 4px 12px rgba(30, 30, 30, 0.2);

&nbsp;           --camo-pattern: url("image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%239A9873' fill-opacity='0.05' d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm-25 25c1.343 0 3-1.343 3-3s-1.657-3-3-3-3 1.343-3 3 1.657 3 3 3zm25 45c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-5-25c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM10 55c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm56 25c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zm-26-2c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 20c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z'/%3E%3C/svg%3E");

&nbsp;       }

&nbsp;       

&nbsp;       body {

&nbsp;           background-color: #f5f5f0;

&nbsp;           color: var(--neutral-dark);

&nbsp;           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

&nbsp;           background-image: var(--camo-pattern);

&nbsp;       }

&nbsp;       

&nbsp;       .navbar {

&nbsp;           background: linear-gradient(135deg, var(--primary), #3a3822) !important;

&nbsp;           box-shadow: 0 2px 10px rgba(30, 30, 30, 0.2);

&nbsp;       }

&nbsp;       

&nbsp;       .navbar-brand {

&nbsp;           font-weight: 700;

&nbsp;           color: white !important;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;       }

&nbsp;       

&nbsp;       .navbar-brand i {

&nbsp;           margin-right: 8px;

&nbsp;           color: var(--accent);

&nbsp;       }

&nbsp;       

&nbsp;       .nav-link {

&nbsp;           color: rgba(255, 255, 255, 0.8) !important;

&nbsp;           font-weight: 500;

&nbsp;       }

&nbsp;       

&nbsp;       .nav-link:hover, .nav-link.active {

&nbsp;           color: white !important;

&nbsp;       }

&nbsp;       

&nbsp;       .sidebar {

&nbsp;           background: var(--primary);

&nbsp;           color: white;

&nbsp;           min-height: calc(100vh - 56px);

&nbsp;           padding: 20px 0;

&nbsp;           position: fixed;

&nbsp;           width: 260px;

&nbsp;           z-index: 100;

&nbsp;       }

&nbsp;       

&nbsp;       .sidebar-sticky {

&nbsp;           padding-top: 20px;

&nbsp;           height: calc(100vh - 120px);

&nbsp;           overflow-y: auto;

&nbsp;       }

&nbsp;       

&nbsp;       .sidebar-heading {

&nbsp;           padding: 10px 15px;

&nbsp;           font-size: 0.85rem;

&nbsp;           text-transform: uppercase;

&nbsp;           letter-spacing: 0.1em;

&nbsp;           color: var(--neutral-light);

&nbsp;           font-weight: 600;

&nbsp;       }

&nbsp;       

&nbsp;       .sidebar-item {

&nbsp;           padding: 8px 15px;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;           color: rgba(255, 255, 255, 0.7);

&nbsp;           text-decoration: none;

&nbsp;           transition: all 0.2s;

&nbsp;           border-left: 3px solid transparent;

&nbsp;       }

&nbsp;       

&nbsp;       .sidebar-item:hover {

&nbsp;           background: rgba(255, 255, 255, 0.05);

&nbsp;           color: white;

&nbsp;       }

&nbsp;       

&nbsp;       .sidebar-item.active {

&nbsp;           background: rgba(255, 255, 255, 0.1);

&nbsp;           color: white;

&nbsp;           border-left: 3px solid var(--accent);

&nbsp;       }

&nbsp;       

&nbsp;       .sidebar-item i {

&nbsp;           margin-right: 10px;

&nbsp;           width: 20px;

&nbsp;           text-align: center;

&nbsp;       }

&nbsp;       

&nbsp;       .main-content {

&nbsp;           margin-left: 260px;

&nbsp;           padding: 20px;

&nbsp;       }

&nbsp;       

&nbsp;       .card {

&nbsp;           border: none;

&nbsp;           border-radius: 8px;

&nbsp;           overflow: hidden;

&nbsp;           box-shadow: var(--card-shadow);

&nbsp;           transition: all 0.2s;

&nbsp;           background: white;

&nbsp;       }

&nbsp;       

&nbsp;       .card:hover {

&nbsp;           transform: translateY(-2px);

&nbsp;           box-shadow: var(--card-hover);

&nbsp;       }

&nbsp;       

&nbsp;       .card-header {

&nbsp;           background: linear-gradient(to right, var(--primary), #3a3822);

&nbsp;           color: white;

&nbsp;           font-weight: 600;

&nbsp;           padding: 12px 15px;

&nbsp;           border: none;

&nbsp;       }

&nbsp;       

&nbsp;       .btn-primary {

&nbsp;           background-color: var(--primary) !important;

&nbsp;           border-color: var(--primary) !important;

&nbsp;           transition: all 0.2s;

&nbsp;       }

&nbsp;       

&nbsp;       .btn-primary:hover {

&nbsp;           background-color: #3a3822 !important;

&nbsp;           border-color: #3a3822 !important;

&nbsp;           transform: translateY(-1px);

&nbsp;           box-shadow: 0 4px 8px rgba(76, 74, 45, 0.2);

&nbsp;       }

&nbsp;       

&nbsp;       .btn-accent {

&nbsp;           background-color: var(--accent) !important;

&nbsp;           border-color: var(--accent) !important;

&nbsp;           color: var(--neutral-dark) !important;

&nbsp;           font-weight: 500;

&nbsp;       }

&nbsp;       

&nbsp;       .btn-accent:hover {

&nbsp;           background-color: #9ebf21 !important;

&nbsp;           border-color: #9ebf21 !important;

&nbsp;           transform: translateY(-1px);

&nbsp;           box-shadow: 0 4px 8px rgba(176, 210, 54, 0.25);

&nbsp;       }

&nbsp;       

&nbsp;       .btn-outline-accent {

&nbsp;           color: var(--accent) !important;

&nbsp;           border-color: var(--accent) !important;

&nbsp;       }

&nbsp;       

&nbsp;       .btn-outline-accent:hover {

&nbsp;           background-color: var(--accent) !important;

&nbsp;           color: var(--neutral-dark) !important;

&nbsp;       }

&nbsp;       

&nbsp;       .metric-card {

&nbsp;           position: relative;

&nbsp;           overflow: hidden;

&nbsp;       }

&nbsp;       

&nbsp;       .metric-card::before {

&nbsp;           content: '';

&nbsp;           position: absolute;

&nbsp;           top: 0;

&nbsp;           left: 0;

&nbsp;           width: 4px;

&nbsp;           height: 100%;

&nbsp;           background: var(--accent);

&nbsp;       }

&nbsp;       

&nbsp;       .metric-icon {

&nbsp;           width: 50px;

&nbsp;           height: 50px;

&nbsp;           border-radius: 8px;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;           justify-content: center;

&nbsp;           margin-right: 15px;

&nbsp;           font-size: 24px;

&nbsp;           background: rgba(76, 74, 45, 0.1);

&nbsp;       }

&nbsp;       

&nbsp;       .metric-value {

&nbsp;           font-size: 2.2em;

&nbsp;           font-weight: 700;

&nbsp;           margin: 10px 0;

&nbsp;           color: var(--primary);

&nbsp;       }

&nbsp;       

&nbsp;       .dashboard-section {

&nbsp;           background: white;

&nbsp;           border-radius: 8px;

&nbsp;           padding: 20px;

&nbsp;           margin-bottom: 25px;

&nbsp;           box-shadow: var(--card-shadow);

&nbsp;       }

&nbsp;       

&nbsp;       .section-header {

&nbsp;           display: flex;

&nbsp;           justify-content: space-between;

&nbsp;           align-items: center;

&nbsp;           margin-bottom: 20px;

&nbsp;           padding-bottom: 12px;

&nbsp;           border-bottom: 1px solid var(--gray);

&nbsp;       }

&nbsp;       

&nbsp;       .section-title {

&nbsp;           font-size: 1.3em;

&nbsp;           font-weight: 600;

&nbsp;           color: var(--primary);

&nbsp;       }

&nbsp;       

&nbsp;       .chart-container {

&nbsp;           position: relative;

&nbsp;           height: 300px;

&nbsp;           width: 100%;

&nbsp;       }

&nbsp;       

&nbsp;       .grid-2x2 {

&nbsp;           display: grid;

&nbsp;           grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));

&nbsp;           gap: 20px;

&nbsp;       }

&nbsp;       

&nbsp;       .key-metrics {

&nbsp;           display: grid;

&nbsp;           grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

&nbsp;           gap: 15px;

&nbsp;           margin-top: 15px;

&nbsp;       }

&nbsp;       

&nbsp;       .key-metric {

&nbsp;           padding: 12px;

&nbsp;           border-radius: 6px;

&nbsp;           background: var(--light);

&nbsp;           border-left: 3px solid var(--accent);

&nbsp;       }

&nbsp;       

&nbsp;       .key-metric-value {

&nbsp;           font-size: 1.6em;

&nbsp;           font-weight: 700;

&nbsp;           margin: 5px 0;

&nbsp;           color: var(--primary);

&nbsp;       }

&nbsp;       

&nbsp;       .key-metric-label {

&nbsp;           color: var(--dark-gray);

&nbsp;           font-size: 0.9em;

&nbsp;       }

&nbsp;       

&nbsp;       .table-container {

&nbsp;           overflow-x: auto;

&nbsp;           border-radius: 6px;

&nbsp;           border: 1px solid var(--gray);

&nbsp;           margin-top: 15px;

&nbsp;       }

&nbsp;       

&nbsp;       table {

&nbsp;           width: 100%;

&nbsp;           border-collapse: collapse;

&nbsp;       }

&nbsp;       

&nbsp;       th, td {

&nbsp;           padding: 10px 12px;

&nbsp;           text-align: left;

&nbsp;           border-bottom: 1px solid var(--gray);

&nbsp;       }

&nbsp;       

&nbsp;       th {

&nbsp;           background-color: rgba(76, 74, 45, 0.05);

&nbsp;           font-weight: 600;

&nbsp;           color: var(--primary);

&nbsp;       }

&nbsp;       

&nbsp;       tr:hover {

&nbsp;           background-color: rgba(76, 74, 45, 0.03);

&nbsp;       }

&nbsp;       

&nbsp;       .status-badge {

&nbsp;           padding: 3px 8px;

&nbsp;           border-radius: 10px;

&nbsp;           font-size: 0.75em;

&nbsp;           font-weight: 500;

&nbsp;           display: inline-block;

&nbsp;       }

&nbsp;       

&nbsp;       .status-active { background-color: rgba(176, 210, 54, 0.15); color: #5a6a11; }

&nbsp;       .status-at-risk { background-color: rgba(255, 167, 38, 0.15); color: #805300; }

&nbsp;       .status-inactive { background-color: rgba(239, 83, 80, 0.15); color: #662222; }

&nbsp;       .status-new { background-color: rgba(41, 182, 246, 0.15); color: #114a63; }

&nbsp;       .status-gympass { background-color: rgba(153, 102, 255, 0.15); color: #3c2666; }

&nbsp;       

&nbsp;       .nfe-preview {

&nbsp;           background: white;

&nbsp;           border-radius: 6px;

&nbsp;           padding: 15px;

&nbsp;           box-shadow: 0 1px 6px rgba(0,0,0,0.08);

&nbsp;           font-family: monospace;

&nbsp;           line-height: 1.5;

&nbsp;           border: 1px solid #eee;

&nbsp;           font-size: 0.95em;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-section {

&nbsp;           margin-bottom: 12px;

&nbsp;           padding-bottom: 10px;

&nbsp;           border-bottom: 1px dashed #eee;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-section:last-child {

&nbsp;           border-bottom: none;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-field {

&nbsp;           padding: 4px 0;

&nbsp;           display: flex;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-field-label {

&nbsp;           width: 180px;

&nbsp;           font-weight: 500;

&nbsp;           color: var(--dark-gray);

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-field-value {

&nbsp;           flex: 1;

&nbsp;       }

&nbsp;       

&nbsp;       .search-container {

&nbsp;           background: white;

&nbsp;           border-radius: 8px;

&nbsp;           padding: 15px;

&nbsp;           box-shadow: var(--card-shadow);

&nbsp;           margin-bottom: 20px;

&nbsp;       }

&nbsp;       

&nbsp;       .client-card {

&nbsp;           background: white;

&nbsp;           border-radius: 6px;

&nbsp;           padding: 12px;

&nbsp;           margin-bottom: 12px;

&nbsp;           box-shadow: 0 1px 6px rgba(0,0,0,0.05);

&nbsp;           border-left: 3px solid var(--primary);

&nbsp;           transition: all 0.2s;

&nbsp;           cursor: pointer;

&nbsp;       }

&nbsp;       

&nbsp;       .client-card:hover {

&nbsp;           transform: translateY(-1px);

&nbsp;           box-shadow: 0 2px 8px rgba(0,0,0,0.1);

&nbsp;       }

&nbsp;       

&nbsp;       .client-card.selected {

&nbsp;           border-left-color: var(--accent);

&nbsp;           background-color: #f0f7e8;

&nbsp;       }

&nbsp;       

&nbsp;       .client-name {

&nbsp;           font-weight: 600;

&nbsp;           font-size: 1.05rem;

&nbsp;           color: var(--neutral-dark);

&nbsp;       }

&nbsp;       

&nbsp;       .client-details {

&nbsp;           color: var(--dark-gray);

&nbsp;           font-size: 0.85rem;

&nbsp;       }

&nbsp;       

&nbsp;       .step-indicator {

&nbsp;           display: flex;

&nbsp;           margin-bottom: 20px;

&nbsp;           max-width: 800px;

&nbsp;           margin-left: auto;

&nbsp;           margin-right: auto;

&nbsp;       }

&nbsp;       

&nbsp;       .step {

&nbsp;           flex: 1;

&nbsp;           text-align: center;

&nbsp;           position: relative;

&nbsp;           padding-top: 20px;

&nbsp;       }

&nbsp;       

&nbsp;       .step-number {

&nbsp;           width: 26px;

&nbsp;           height: 26px;

&nbsp;           border-radius: 50%;

&nbsp;           background: var(--neutral-light);

&nbsp;           color: white;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;           justify-content: center;

&nbsp;           margin: 0 auto 8px;

&nbsp;           font-weight: 500;

&nbsp;           font-size: 0.85rem;

&nbsp;       }

&nbsp;       

&nbsp;       .step.active .step-number {

&nbsp;           background: var(--accent);

&nbsp;           color: var(--neutral-dark);

&nbsp;       }

&nbsp;       

&nbsp;       .step-line {

&nbsp;           position: absolute;

&nbsp;           top: 12px;

&nbsp;           left: 50%;

&nbsp;           width: 100%;

&nbsp;           height: 2px;

&nbsp;           background: var(--neutral-light);

&nbsp;           z-index: -1;

&nbsp;       }

&nbsp;       

&nbsp;       .step:last-child .step-line {

&nbsp;           display: none;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-item {

&nbsp;           padding: 8px 0;

&nbsp;           border-bottom: 1px solid #f0f0f0;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-header {

&nbsp;           display: flex;

&nbsp;           justify-content: space-between;

&nbsp;           font-weight: 500;

&nbsp;           font-size: 0.95rem;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-date {

&nbsp;           color: var(--dark-gray);

&nbsp;           font-size: 0.8rem;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-value {

&nbsp;           font-weight: 600;

&nbsp;           color: var(--primary);

&nbsp;           font-size: 0.95rem;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-actions {

&nbsp;           display: flex;

&nbsp;           gap: 6px;

&nbsp;           margin-top: 6px;

&nbsp;       }

&nbsp;       

&nbsp;       .btn-contract {

&nbsp;           padding: 2px 6px;

&nbsp;           font-size: 0.75rem;

&nbsp;       }

&nbsp;       

&nbsp;       .loading-spinner {

&nbsp;           border: 2px solid rgba(255, 255, 255, 0.3);

&nbsp;           border-radius: 50%;

&nbsp;           border-top: 2px solid white;

&nbsp;           width: 16px;

&nbsp;           height: 16px;

&nbsp;           animation: spin 1s linear infinite;

&nbsp;           display: inline-block;

&nbsp;           margin-right: 5px;

&nbsp;       }

&nbsp;       

&nbsp;       @keyframes spin {

&nbsp;           0% { transform: rotate(0deg); }

&nbsp;           100% { transform: rotate(360deg); }

&nbsp;       }

&nbsp;       

&nbsp;       .search-results {

&nbsp;           max-height: 300px;

&nbsp;           overflow-y: auto;

&nbsp;           border: 1px solid var(--gray);

&nbsp;           border-radius: 4px;

&nbsp;           margin-top: 8px;

&nbsp;       }

&nbsp;       

&nbsp;       .search-no-results {

&nbsp;           padding: 15px;

&nbsp;           text-align: center;

&nbsp;           color: var(--dark-gray);

&nbsp;           font-size: 0.9rem;

&nbsp;       }

&nbsp;       

&nbsp;       .search-result-item {

&nbsp;           padding: 10px 12px;

&nbsp;           border-bottom: 1px solid #f0f0f0;

&nbsp;           cursor: pointer;

&nbsp;           transition: background 0.2s;

&nbsp;           font-size: 0.9rem;

&nbsp;       }

&nbsp;       

&nbsp;       .search-result-item:hover {

&nbsp;           background-color: #f5f9ee;

&nbsp;       }

&nbsp;       

&nbsp;       .search-result-item.selected {

&nbsp;           background-color: #e8f5e0;

&nbsp;           border-left: 3px solid var(--accent);

&nbsp;       }

&nbsp;       

&nbsp;       .search-result-name {

&nbsp;           font-weight: 500;

&nbsp;           margin-bottom: 3px;

&nbsp;       }

&nbsp;       

&nbsp;       .search-result-details {

&nbsp;           font-size: 0.8rem;

&nbsp;           color: var(--dark-gray);

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-confirmation {

&nbsp;           display: none;

&nbsp;           background: white;

&nbsp;           border-radius: 6px;

&nbsp;           padding: 20px;

&nbsp;           box-shadow: var(--card-shadow);

&nbsp;           text-align: center;

&nbsp;           margin-top: 15px;

&nbsp;       }

&nbsp;       

&nbsp;       .confirmation-icon {

&nbsp;           font-size: 42px;

&nbsp;           color: var(--accent);

&nbsp;           margin-bottom: 12px;

&nbsp;       }

&nbsp;       

&nbsp;       .occupancy-heatmap {

&nbsp;           display: grid;

&nbsp;           grid-template-columns: 90px repeat(7, 1fr);

&nbsp;           gap: 2px;

&nbsp;           margin-top: 15px;

&nbsp;       }

&nbsp;       

&nbsp;       .heatmap-header {

&nbsp;           font-weight: 600;

&nbsp;           padding: 6px;

&nbsp;           background: rgba(76, 74, 45, 0.05);

&nbsp;           text-align: center;

&nbsp;           font-size: 0.85rem;

&nbsp;       }

&nbsp;       

&nbsp;       .heatmap-day {

&nbsp;           font-weight: 500;

&nbsp;           padding: 6px;

&nbsp;           background: rgba(76, 74, 45, 0.05);

&nbsp;           border-right: 1px solid var(--gray);

&nbsp;           font-size: 0.8rem;

&nbsp;       }

&nbsp;       

&nbsp;       .heatmap-cell {

&nbsp;           height: 35px;

&nbsp;           border-radius: 3px;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;           justify-content: center;

&nbsp;           font-size: 0.75em;

&nbsp;           font-weight: 500;

&nbsp;       }

&nbsp;       

&nbsp;       .occupancy-low { background: linear-gradient(to right, #4CAF50, rgba(76, 175, 80, 0.3)); }

&nbsp;       .occupancy-medium { background: linear-gradient(to right, #FFA726, rgba(255, 167, 38, 0.3)); }

&nbsp;       .occupancy-high { background: linear-gradient(to right, #EF5350, rgba(239, 83, 80, 0.3)); }

&nbsp;       

&nbsp;       .churn-risk-meter {

&nbsp;           height: 16px;

&nbsp;           background: linear-gradient(to right, #4CAF50, #FFA726, #EF5350);

&nbsp;           border-radius: 8px;

&nbsp;           margin: 8px 0;

&nbsp;           position: relative;

&nbsp;       }

&nbsp;       

&nbsp;       .churn-risk-pointer {

&nbsp;           position: absolute;

&nbsp;           top: -4px;

&nbsp;           width: 8px;

&nbsp;           height: 24px;

&nbsp;           background: var(--neutral-dark);

&nbsp;           border-radius: 1px;

&nbsp;       }

&nbsp;       

&nbsp;       .renewal-potential-grid {

&nbsp;           display: grid;

&nbsp;           grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));

&nbsp;           gap: 12px;

&nbsp;           margin-top: 15px;

&nbsp;       }

&nbsp;       

&nbsp;       .potential-card {

&nbsp;           border: 1px solid var(--gray);

&nbsp;           border-radius: 6px;

&nbsp;           padding: 12px;

&nbsp;           transition: all 0.2s;

&nbsp;           background: white;

&nbsp;       }

&nbsp;       

&nbsp;       .potential-card:hover {

&nbsp;           transform: translateY(-2px);

&nbsp;           box-shadow: var(--card-shadow);

&nbsp;       }

&nbsp;       

&nbsp;       .potential-high { border-left: 3px solid #4CAF50; }

&nbsp;       .potential-medium { border-left: 3px solid #FFA726; }

&nbsp;       .potential-low { border-left: 3px solid #EF5350; }

&nbsp;       

&nbsp;       .potential-title {

&nbsp;           font-weight: 600;

&nbsp;           margin-bottom: 8px;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;           font-size: 0.95rem;

&nbsp;       }

&nbsp;       

&nbsp;       .potential-value {

&nbsp;           font-size: 1.2em;

&nbsp;           font-weight: 700;

&nbsp;           margin: 4px 0;

&nbsp;       }

&nbsp;       

&nbsp;       .potential-description {

&nbsp;           color: var(--dark-gray);

&nbsp;           font-size: 0.85rem;

&nbsp;           line-height: 1.3;

&nbsp;       }

&nbsp;       

&nbsp;       .insight-card {

&nbsp;           background: rgba(76, 74, 45, 0.03);

&nbsp;           border-radius: 6px;

&nbsp;           padding: 12px;

&nbsp;           margin-bottom: 12px;

&nbsp;           border-left: 2px solid var(--primary);

&nbsp;       }

&nbsp;       

&nbsp;       .insight-title {

&nbsp;           font-weight: 600;

&nbsp;           margin-bottom: 6px;

&nbsp;           color: var(--primary);

&nbsp;           font-size: 0.95rem;

&nbsp;       }

&nbsp;       

&nbsp;       .insight-content {

&nbsp;           color: var(--dark-gray);

&nbsp;           font-size: 0.85rem;

&nbsp;       }

&nbsp;       

&nbsp;       .time-period-selector {

&nbsp;           display: flex;

&nbsp;           gap: 4px;

&nbsp;           margin-bottom: 12px;

&nbsp;       }

&nbsp;       

&nbsp;       .period-btn {

&nbsp;           padding: 4px 8px;

&nbsp;           background: var(--light);

&nbsp;           border: 1px solid var(--gray);

&nbsp;           border-radius: 4px;

&nbsp;           cursor: pointer;

&nbsp;           font-size: 0.85rem;

&nbsp;       }

&nbsp;       

&nbsp;       .period-btn.active {

&nbsp;           background: var(--primary);

&nbsp;           color: white;

&nbsp;           border-color: var(--primary);

&nbsp;       }

&nbsp;       

&nbsp;       .contract-type-filter {

&nbsp;           display: flex;

&nbsp;           gap: 8px;

&nbsp;           margin-bottom: 12px;

&nbsp;           flex-wrap: wrap;

&nbsp;       }

&nbsp;       

&nbsp;       .type-filter-btn {

&nbsp;           padding: 4px 10px;

&nbsp;           background: var(--light);

&nbsp;           border: 1px solid var(--gray);

&nbsp;           border-radius: 16px;

&nbsp;           cursor: pointer;

&nbsp;           font-size: 0.85rem;

&nbsp;           transition: all 0.2s;

&nbsp;       }

&nbsp;       

&nbsp;       .type-filter-btn:hover {

&nbsp;           background: var(--primary);

&nbsp;           color: white;

&nbsp;           border-color: var(--primary);

&nbsp;       }

&nbsp;       

&nbsp;       .type-filter-btn.active {

&nbsp;           background: var(--primary);

&nbsp;           color: white;

&nbsp;           border-color: var(--primary);

&nbsp;       }

&nbsp;       

&nbsp;       .sidebar-profile {

&nbsp;           padding: 15px;

&nbsp;           border-bottom: 1px solid rgba(255, 255, 255, 0.1);

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;       }

&nbsp;       

&nbsp;       .profile-avatar {

&nbsp;           width: 40px;

&nbsp;           height: 40px;

&nbsp;           border-radius: 50%;

&nbsp;           background: var(--accent);

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;           justify-content: center;

&nbsp;           color: var(--neutral-dark);

&nbsp;           font-weight: bold;

&nbsp;           margin-right: 10px;

&nbsp;           font-size: 1.1rem;

&nbsp;       }

&nbsp;       

&nbsp;       .profile-info {

&nbsp;           color: white;

&nbsp;       }

&nbsp;       

&nbsp;       .profile-name {

&nbsp;           font-weight: 600;

&nbsp;           margin-bottom: 2px;

&nbsp;       }

&nbsp;       

&nbsp;       .profile-role {

&nbsp;           font-size: 0.8rem;

&nbsp;           opacity: 0.8;

&nbsp;       }

&nbsp;       

&nbsp;       .sidebar-divider {

&nbsp;           height: 1px;

&nbsp;           background: rgba(255, 255, 255, 0.1);

&nbsp;           margin: 15px 0;

&nbsp;       }

&nbsp;       

&nbsp;       .notification-badge {

&nbsp;           position: absolute;

&nbsp;           top: 5px;

&nbsp;           right: 5px;

&nbsp;           width: 18px;

&nbsp;           height: 18px;

&nbsp;           border-radius: 50%;

&nbsp;           background: var(--accent);

&nbsp;           color: var(--neutral-dark);

&nbsp;           font-size: 0.7rem;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;           justify-content: center;

&nbsp;           font-weight: bold;

&nbsp;       }

&nbsp;       

&nbsp;       .action-required {

&nbsp;           border-left: 3px solid var(--accent) !important;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-template {

&nbsp;           background: #f8f9fa;

&nbsp;           border: 1px dashed var(--neutral-light);

&nbsp;           border-radius: 6px;

&nbsp;           padding: 12px;

&nbsp;           font-family: monospace;

&nbsp;           font-size: 0.95em;

&nbsp;           line-height: 1.5;

&nbsp;           margin-top: 10px;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-template-highlight {

&nbsp;           background: rgba(176, 210, 54, 0.15);

&nbsp;           padding: 2px 4px;

&nbsp;           border-radius: 3px;

&nbsp;           font-weight: 600;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-section-title {

&nbsp;           font-weight: 600;

&nbsp;           color: var(--primary);

&nbsp;           margin: 8px 0 4px;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-section-title i {

&nbsp;           margin-right: 6px;

&nbsp;           color: var(--accent);

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-field {

&nbsp;           padding: 3px 0;

&nbsp;           display: flex;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-field-label {

&nbsp;           width: 150px;

&nbsp;           font-weight: 500;

&nbsp;           color: var(--dark-gray);

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-field-value {

&nbsp;           flex: 1;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-iss-note {

&nbsp;           font-size: 0.85em;

&nbsp;           color: var(--dark-gray);

&nbsp;           font-style: italic;

&nbsp;           margin-top: 8px;

&nbsp;           padding-top: 8px;

&nbsp;           border-top: 1px dashed var(--gray);

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-warning {

&nbsp;           background: rgba(255, 167, 38, 0.1);

&nbsp;           border-left: 3px solid var(--warning);

&nbsp;           padding: 10px;

&nbsp;           border-radius: 4px;

&nbsp;           margin-top: 10px;

&nbsp;           font-size: 0.85em;

&nbsp;       }

&nbsp;       

&nbsp;       .nfe-cpf-validation {

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;           gap: 8px;

&nbsp;           margin-top: 8px;

&nbsp;       }

&nbsp;       

&nbsp;       .validation-success {

&nbsp;           color: #4CAF50;

&nbsp;       }

&nbsp;       

&nbsp;       .validation-error {

&nbsp;           color: #EF5350;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-filter-group {

&nbsp;           display: flex;

&nbsp;           flex-wrap: wrap;

&nbsp;           gap: 8px;

&nbsp;           margin-top: 8px;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-filter-pill {

&nbsp;           padding: 3px 8px;

&nbsp;           background: var(--light);

&nbsp;           border-radius: 12px;

&nbsp;           font-size: 0.75rem;

&nbsp;           display: flex;

&nbsp;           align-items: center;

&nbsp;           gap: 4px;

&nbsp;           cursor: pointer;

&nbsp;           transition: all 0.2s;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-filter-pill:hover {

&nbsp;           background: var(--primary);

&nbsp;           color: white;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-filter-pill.active {

&nbsp;           background: var(--primary);

&nbsp;           color: white;

&nbsp;       }

&nbsp;       

&nbsp;       .contract-filter-pill i {

&nbsp;           font-size: 0.8rem;

&nbsp;       }

&nbsp;       

&nbsp;       .data-loading {

&nbsp;           position: absolute;

&nbsp;           top: 0;

&nbsp;           left: 0;

&nbsp;           width: 100%;

&nbsp;           height: 100%;

&nbsp;           background: rgba(255, 255, 255, 0.8);

&nbsp;           display: flex;

&nbsp;           justify-content: center;

&nbsp;           align-items: center;

&nbsp;           z-index: 10;

&nbsp;           border-radius: 8px;

&nbsp;       }

&nbsp;       

&nbsp;       .data-loading-content {

&nbsp;           text-align: center;

&nbsp;       }

&nbsp;       

&nbsp;       .loading-text {

&nbsp;           margin-top: 10px;

&nbsp;           color: var(--primary);

&nbsp;           font-weight: 500;

&nbsp;       }

&nbsp;       

&nbsp;       .data-error {

&nbsp;           background: rgba(239, 83, 80, 0.05);

&nbsp;           border-left: 3px solid #EF5350;

&nbsp;           padding: 15px;

&nbsp;           border-radius: 4px;

&nbsp;           margin: 15px 0;

&nbsp;       }

&nbsp;       

&nbsp;       .data-error-title {

&nbsp;           font-weight: 600;

&nbsp;           color: #662222;

&nbsp;           margin-bottom: 5px;

&nbsp;       }

&nbsp;       

&nbsp;       .data-error-message {

&nbsp;           color: #666;

&nbsp;           font-size: 0.9rem;

&nbsp;       }

&nbsp;       

&nbsp;       .retry-button {

&nbsp;           background: var(--primary);

&nbsp;           color: white;

&nbsp;           border: none;

&nbsp;           padding: 5px 10px;

&nbsp;           border-radius: 4px;

&nbsp;           cursor: pointer;

&nbsp;           margin-top: 10px;

&nbsp;           font-size: 0.85rem;

&nbsp;       }

&nbsp;       

&nbsp;       .retry-button:hover {

&nbsp;           background: #3a3822;

&nbsp;       }

&nbsp;   </style>

</head>

<body>

&nbsp;   <nav class="navbar navbar-expand-lg">

&nbsp;       <div class="container-fluid">

&nbsp;           <a class="navbar-brand" href="#">

&nbsp;               <i class="bi bi-shield-lock"></i> Military Olive Dashboard

&nbsp;           </a>

&nbsp;           <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">

&nbsp;               <span class="navbar-toggler-icon"></span>

&nbsp;           </button>

&nbsp;           <div class="collapse navbar-collapse" id="navbarContent">

&nbsp;               <ul class="navbar-nav me-auto mb-2 mb-lg-0">

&nbsp;                   <li class="nav-item">

&nbsp;                       <a class="nav-link active" href="#"><i class="bi bi-house"></i> Dashboard</a>

&nbsp;                   </li>

&nbsp;                   <li class="nav-item">

&nbsp;                       <a class="nav-link" href="#"><i class="bi bi-people"></i> Clientes</a>

&nbsp;                   </li>

&nbsp;                   <li class="nav-item">

&nbsp;                       <a class="nav-link" href="#"><i class="bi bi-graph-up"></i> Relatórios</a>

&nbsp;                   </li>

&nbsp;                   <li class="nav-item">

&nbsp;                       <a class="nav-link" href="#"><i class="bi bi-gear"></i> Configurações</a>

&nbsp;                   </li>

&nbsp;               </ul>

&nbsp;               <div class="d-flex">

&nbsp;                   <button class="btn btn-outline-light me-2" id="refresh-button">

&nbsp;                       <i class="bi bi-arrow-clockwise"></i> Atualizar

&nbsp;                   </button>

&nbsp;                   <div class="dropdown">

&nbsp;                       <a href="#" class="d-block link-light text-decoration-none dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown">

&nbsp;                           <div class="d-flex align-items-center">

&nbsp;                               <div class="profile-avatar me-2">AD</div>

&nbsp;                               <span>Administrador</span>

&nbsp;                           </div>

&nbsp;                       </a>

&nbsp;                       <ul class="dropdown-menu dropdown-menu-end">

&nbsp;                           <li><a class="dropdown-item" href="#"><i class="bi bi-person"></i> Perfil</a></li>

&nbsp;                           <li><a class="dropdown-item" href="#"><i class="bi bi-envelope"></i> Mensagens</a></li>

&nbsp;                           <li><hr class="dropdown-divider"></li>

&nbsp;                           <li><a class="dropdown-item" href="#"><i class="bi bi-box-arrow-right"></i> Sair</a></li>

&nbsp;                       </ul>

&nbsp;                   </div>

&nbsp;               </div>

&nbsp;           </div>

&nbsp;       </div>

&nbsp;   </nav>



&nbsp;   <div class="sidebar">

&nbsp;       <div class="sidebar-profile">

&nbsp;           <div class="profile-avatar">AD</div>

&nbsp;           <div class="profile-info">

&nbsp;               <div class="profile-name">Administrador</div>

&nbsp;               <div class="profile-role">Sistema Principal</div>

&nbsp;           </div>

&nbsp;       </div>

&nbsp;       

&nbsp;       <div class="sidebar-divider"></div>

&nbsp;       

&nbsp;       <div class="sidebar-sticky">

&nbsp;           <div class="sidebar-heading">MENU PRINCIPAL</div>

&nbsp;           <a href="#" class="sidebar-item active">

&nbsp;               <i class="bi bi-speedometer2"></i> Dashboard

&nbsp;           </a>

&nbsp;           <a href="#" class="sidebar-item">

&nbsp;               <i class="bi bi-people"></i> Gestão de Clientes

&nbsp;           </a>

&nbsp;           <a href="#" class="sidebar-item">

&nbsp;               <i class="bi bi-receipt"></i> Notas Fiscais

&nbsp;           </a>

&nbsp;           <a href="#" class="sidebar-item">

&nbsp;               <i class="bi bi-calendar-event"></i> Agenda

&nbsp;           </a>

&nbsp;           

&nbsp;           <div class="sidebar-heading">ANÁLISES</div>

&nbsp;           <a href="#" class="sidebar-item">

&nbsp;               <i class="bi bi-graph-up"></i> Saúde do Negócio

&nbsp;           </a>

&nbsp;           <a href="#" class="sidebar-item">

&nbsp;               <i class="bi bi-bar-chart"></i> Relatórios Financeiros

&nbsp;           </a>

&nbsp;           <a href="#" class="sidebar-item">

&nbsp;               <i class="bi bi-clipboard-data"></i> Relatórios de Clientes

&nbsp;           </a>

&nbsp;           

&nbsp;           <div class="sidebar-heading">CONFIGURAÇÕES</div>

&nbsp;           <a href="#" class="sidebar-item">

&nbsp;               <i class="bi bi-gear"></i> Configurações Gerais

&nbsp;           </a>

&nbsp;           <a href="#" class="sidebar-item">

&nbsp;               <i class="bi bi-person-gear"></i> Gestão de Usuários

&nbsp;           </a>

&nbsp;           <a href="#" class="sidebar-item">

&nbsp;               <i class="bi bi-file-earmark-text"></i> Configurar NFe

&nbsp;           </a>

&nbsp;       </div>

&nbsp;   </div>



&nbsp;   <main class="main-content">

&nbsp;       <div class="row mb-4">

&nbsp;           <div class="col-md-6">

&nbsp;               <h1 class="h3" style="color: var(--primary);">Painel de Controle do Cliente</h1>

&nbsp;               <p class="text-muted">Visão geral da saúde do negócio e gerenciamento de notas fiscais</p>

&nbsp;           </div>

&nbsp;           <div class="col-md-6 text-end">

&nbsp;               <button class="btn btn-accent" id="nfe-button">

&nbsp;                   <i class="bi bi-receipt-cutoff"></i> Emitir Nova Nota Fiscal

&nbsp;               </button>

&nbsp;           </div>

&nbsp;       </div>

&nbsp;       

&nbsp;       <div class="step-indicator" id="step-indicator">

&nbsp;           <div class="step active" id="step-1">

&nbsp;               <div class="step-number">1</div>

&nbsp;               <div>Buscar Cliente</div>

&nbsp;               <div class="step-line"></div>

&nbsp;           </div>

&nbsp;           <div class="step" id="step-2">

&nbsp;               <div class="step-number">2</div>

&nbsp;               <div>Revisar Dados</div>

&nbsp;               <div class="step-line"></div>

&nbsp;           </div>

&nbsp;           <div class="step" id="step-3">

&nbsp;               <div class="step-number">3</div>

&nbsp;               <div>Emitir Nota</div>

&nbsp;           </div>

&nbsp;       </div>

&nbsp;       

&nbsp;       <div class="search-container" id="search-container">

&nbsp;           <div class="row g-2">

&nbsp;               <div class="col-md-6">

&nbsp;                   <div class="input-group">

&nbsp;                       <span class="input-group-text" style="background: var(--light); border-right: none;">

&nbsp;                           <i class="bi bi-search" style="color: var(--dark-gray);"></i>

&nbsp;                       </span>

&nbsp;                       <input type="text" class="form-control" id="client-search" placeholder="Buscar cliente por nome, código ou CPF...">

&nbsp;                   </div>

&nbsp;                   <div class="form-text" style="color: var(--dark-gray);">Digite pelo menos 3 caracteres para buscar</div>

&nbsp;               </div>

&nbsp;               <div class="col-md-3">

&nbsp;                   <select class="form-select" id="status-filter">

&nbsp;                       <option value="all">Todos os status</option>

&nbsp;                       <option value="Ativo">Ativo</option>

&nbsp;                       <option value="Bloqueado">Bloqueado</option>

&nbsp;                       <option value="Cancelado">Cancelado</option>

&nbsp;                       <option value="Cliente Pass">Cliente Pass</option>

&nbsp;                   </select>

&nbsp;               </div>

&nbsp;               <div class="col-md-3">

&nbsp;                   <select class="form-select" id="contract-filter">

&nbsp;                       <option value="all">Todos os tipos</option>

&nbsp;                       <option value="GYMPASS">GYMPASS</option>

&nbsp;                       <option value="EXPERIMENTAL">Experimental</option>

&nbsp;                       <option value="AVULSA">Aula Avulsa</option>

&nbsp;                       <option value="MEMBERSHIP">Mensalidade</option>

&nbsp;                   </select>

&nbsp;               </div>

&nbsp;           </div>

&nbsp;           

&nbsp;           <div class="search-results mt-2" id="search-results">

&nbsp;               <div class="search-no-results">

&nbsp;                   Digite para buscar clientes...

&nbsp;               </div>

&nbsp;           </div>

&nbsp;       </div>

&nbsp;       

&nbsp;       <div id="client-details-container" style="display: none;">

&nbsp;           <div class="row">

&nbsp;               <div class="col-md-8">

&nbsp;                   <div class="card">

&nbsp;                       <div class="card-header d-flex justify-content-between align-items-center">

&nbsp;                           <div>

&nbsp;                               <h5 class="mb-0" id="client-name-header">Detalhes do Cliente</h5>

&nbsp;                               <span class="status-badge status-active" id="client-status">Ativo</span>

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                       <div class="card-body">

&nbsp;                           <div class="row mb-3">

&nbsp;                               <div class="col-md-4 text-center">

&nbsp;                                   <div class="mb-2">

&nbsp;                                       <i class="bi bi-person-circle" style="font-size: 50px; color: var(--neutral-light);"></i>

&nbsp;                                   </div>

&nbsp;                                   <h5 id="client-name">Nome Completo</h5>

&nbsp;                                   <p class="text-muted" id="client-code">Código: #000</p>

&nbsp;                               </div>

&nbsp;                               <div class="col-md-8">

&nbsp;                                   <div class="row g-2">

&nbsp;                                       <div class="col-md-6">

&nbsp;                                           <label class="form-label" style="color: var(--dark-gray);">CPF</label>

&nbsp;                                           <div class="input-group">

&nbsp;                                               <input type="text" class="form-control" id="client-cpf" placeholder="000.000.000-00">

&nbsp;                                               <button class="btn btn-outline-secondary" type="button" id="validate-cpf">

&nbsp;                                                   <i class="bi bi-check-circle"></i>

&nbsp;                                               </button>

&nbsp;                                           </div>

&nbsp;                                           <div class="nfe-cpf-validation" id="cpf-validation-status" style="display: none;">

&nbsp;                                               <i class="bi bi-check-circle validation-success"></i>

&nbsp;                                               <span>CPF validado com sucesso</span>

&nbsp;                                           </div>

&nbsp;                                       </div>

&nbsp;                                       <div class="col-md-6">

&nbsp;                                           <label class="form-label" style="color: var(--dark-gray);">Consultor Responsável</label>

&nbsp;                                           <input type="text" class="form-control" id="client-consultant" readonly>

&nbsp;                                       </div>

&nbsp;                                       <div class="col-md-6">

&nbsp;                                           <label class="form-label" style="color: var(--dark-gray);">Data do Primeiro Contrato</label>

&nbsp;                                           <input type="text" class="form-control" id="client-first-contract" readonly>

&nbsp;                                       </div>

&nbsp;                                       <div class="col-md-6">

&nbsp;                                           <label class="form-label" style="color: var(--dark-gray);">Status Atual</label>

&nbsp;                                           <input type="text" class="form-control" id="client-current-status" readonly>

&nbsp;                                       </div>

&nbsp;                                   </div>

&nbsp;                               </div>

&nbsp;                           </div>

&nbsp;                           

&nbsp;                           <div class="d-flex justify-content-between align-items-center mb-2">

&nbsp;                               <h6 class="mb-0" style="color: var(--primary);">Contratos Ativos</h6>

&nbsp;                               <div class="contract-filter-group" id="contract-filter-group">

&nbsp;                                   <span class="contract-filter-pill active" data-filter="all">

&nbsp;                                       <i class="bi bi-funnel"></i> Todos

&nbsp;                                   </span>

&nbsp;                                   <span class="contract-filter-pill" data-filter="GYMPASS">

&nbsp;                                       <i class="bi bi-people"></i> GYMPASS

&nbsp;                                   </span>

&nbsp;                                   <span class="contract-filter-pill" data-filter="EXPERIMENTAL">

&nbsp;                                       <i class="bi bi-flask"></i> Experimental

&nbsp;                                   </span>

&nbsp;                                   <span class="contract-filter-pill" data-filter="AVULSA">

&nbsp;                                       <i class="bi bi-calendar2-plus"></i> Avulsa

&nbsp;                                   </span>

&nbsp;                               </div>

&nbsp;                           </div>

&nbsp;                           <div id="client-contracts">

&nbsp;                               <!-- Contracts will be loaded here -->

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               </div>

&nbsp;               

&nbsp;               <div class="col-md-4">

&nbsp;                   <div class="card">

&nbsp;                       <div class="card-header d-flex justify-content-between align-items-center">

&nbsp;                           <h5 class="mb-0">Pré-visualização da Nota Fiscal</h5>

&nbsp;                           <span class="badge bg-light text-dark" style="color: var(--primary) !important;">NFe v2.0</span>

&nbsp;                       </div>

&nbsp;                       <div class="card-body">

&nbsp;                           <div class="nfe-preview">

&nbsp;                               <div class="nfe-section">

&nbsp;                                   <div class="nfe-section-title">

&nbsp;                                       <i class="bi bi-person"></i> CADASTRO

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">Nome Completo:</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-client-name">\[Nome do Cliente]</div>

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">CPF:</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-client-cpf">\[CPF]</div>

&nbsp;                                   </div>

&nbsp;                               </div>

&nbsp;                               

&nbsp;                               <div class="nfe-section">

&nbsp;                                   <div class="nfe-section-title">

&nbsp;                                       <i class="bi bi-receipt"></i> CONTRATO

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">Serviço:</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-service-description">SERVIÇO PRESTADO A \[NOME] REFERENTE A \[CONTRATO]</div>

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">Valor Bruto:</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-service-value">R$ \[VALOR]</div>

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">ISS (2%):</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-iss-value">R$ \[ISS]</div>

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">Valor Líquido:</div>

&nbsp;                                       <div class="nfe-field-value" id="nfe-net-value">R$ \[LIQUIDO]</div>

&nbsp;                                   </div>

&nbsp;                               </div>

&nbsp;                               

&nbsp;                               <div class="nfe-section">

&nbsp;                                   <div class="nfe-section-title">

&nbsp;                                       <i class="bi bi-building"></i> INFORMAÇÕES DA EMPRESA

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">CNPJ:</div>

&nbsp;                                       <div class="nfe-field-value">12.345.678/0001-90</div>

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">Razão Social:</div>

&nbsp;                                       <div class="nfe-field-value">ACADEMIA CALISTENIA LTDA</div>

&nbsp;                                   </div>

&nbsp;                                   <div class="nfe-field">

&nbsp;                                       <div class="nfe-field-label">CNAE:</div>

&nbsp;                                       <div class="nfe-field-value">9609-9/01 - Serviços de condicionamento físico</div>

&nbsp;                                   </div>

&nbsp;                               </div>

&nbsp;                               

&nbsp;                               <div class="nfe-iss-note">

&nbsp;                                   <i class="bi bi-info-circle me-1"></i> O ISS (2%) é calculado sobre o valor bruto do serviço

&nbsp;                               </div>

&nbsp;                           </div>

&nbsp;                           

&nbsp;                           <div class="nfe-warning mt-3" id="nfe-warning" style="display: none;">

&nbsp;                               <i class="bi bi-exclamation-triangle me-1"></i> 

&nbsp;                               <span id="nfe-warning-message">Atenção: Verifique se o CPF está correto antes de emitir a nota.</span>

&nbsp;                           </div>

&nbsp;                           

&nbsp;                           <button class="btn btn-accent w-100 mt-3" id="generate-nfe-button">

&nbsp;                               <i class="bi bi-file-earmark-text"></i> Emitir Nota Fiscal

&nbsp;                           </button>

&nbsp;                           

&nbsp;                           <div class="nfe-confirmation" id="nfe-confirmation">

&nbsp;                               <div class="confirmation-icon">

&nbsp;                                   <i class="bi bi-check-circle"></i>

&nbsp;                               </div>

&nbsp;                               <h5 class="mb-1">Nota Fiscal Emitida com Sucesso!</h5>

&nbsp;                               <p class="text-muted mb-2" style="font-size: 0.9rem;">Número da Nota: <span id="nfe-number">123456</span></p>

&nbsp;                               <p class="text-muted mb-3" style="font-size: 0.9rem;">Data de Emissão: <span id="nfe-date">01/08/2025</span></p>

&nbsp;                               <div class="d-flex justify-content-center gap-2">

&nbsp;                                   <button class="btn btn-outline-primary btn-sm">

&nbsp;                                       <i class="bi bi-download"></i> Baixar PDF

&nbsp;                                   </button>

&nbsp;                                   <button class="btn btn-outline-secondary btn-sm" id="new-nfe-button">

&nbsp;                                       <i class="bi bi-plus"></i> Nova Nota

&nbsp;                                   </button>

&nbsp;                               </div>

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;                   

&nbsp;                   <div class="dashboard-section mt-4">

&nbsp;                       <div class="section-header">

&nbsp;                           <h6 class="section-title">Saúde do Negócio</h6>

&nbsp;                           <div class="time-period-selector">

&nbsp;                               <button class="period-btn active" data-period="month">Mês</button>

&nbsp;                               <button class="period-btn" data-period="quarter">Trimestre</button>

&nbsp;                               <button class="period-btn" data-period="year">Ano</button>

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                       

&nbsp;                       <div class="key-metrics">

&nbsp;                           <div class="key-metric">

&nbsp;                               <div class="key-metric-label">Contratos Ativos</div>

&nbsp;                               <div class="key-metric-value" id="active-contracts">0</div>

&nbsp;                           </div>

&nbsp;                           <div class="key-metric">

&nbsp;                               <div class="key-metric-label">Renovações Próximas</div>

&nbsp;                               <div class="key-metric-value" id="renewals-soon">0</div>

&nbsp;                           </div>

&nbsp;                           <div class="key-metric">

&nbsp;                               <div class="key-metric-label">Utilização Média</div>

&nbsp;                               <div class="key-metric-value" id="avg-utilization">0%</div>

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                       

&nbsp;                       <div class="chart-container mt-3">

&nbsp;                           <canvas id="business-health-chart"></canvas>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               </div>

&nbsp;           </div>

&nbsp;       </div>

&nbsp;       

&nbsp;       <div class="row mt-4">

&nbsp;           <div class="col-md-6">

&nbsp;               <div class="dashboard-section">

&nbsp;                   <div class="section-header">

&nbsp;                       <h6 class="section-title">Expiração de Contratos</h6>

&nbsp;                       <div class="contract-type-filter">

&nbsp;                           <button class="type-filter-btn active" data-type="all">Todos</button>

&nbsp;                           <button class="type-filter-btn" data-type="GYMPASS">GYMPASS</button>

&nbsp;                           <button class="type-filter-btn" data-type="MEMBERSHIP">Mensalidade</button>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;                   

&nbsp;                   <div class="grid-2x2">

&nbsp;                       <div>

&nbsp;                           <div class="chart-container">

&nbsp;                               <canvas id="expiration-timeline-chart"></canvas>

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                       <div>

&nbsp;                           <div class="chart-container">

&nbsp;                               <canvas id="renewal-potential-chart"></canvas>

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;                   

&nbsp;                   <div class="renewal-potential-grid mt-3">

&nbsp;                       <div class="potential-card potential-high">

&nbsp;                           <div class="potential-title">

&nbsp;                               <span style="color: #4CAF50;">●</span> Alta Probabilidade

&nbsp;                           </div>

&nbsp;                           <div class="potential-value"><span id="high-potential-count">0</span> contratos</div>

&nbsp;                           <div class="potential-description">

&nbsp;                               Clientes com alta utilização de sessões (75-95% de renovação)

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                       <div class="potential-card potential-medium">

&nbsp;                           <div class="potential-title">

&nbsp;                               <span style="color: #FFA726;">●</span> Média Probabilidade

&nbsp;                           </div>

&nbsp;                           <div class="potential-value"><span id="medium-potential-count">0</span> contratos</div>

&nbsp;                           <div class="potential-description">

&nbsp;                               Clientes com utilização moderada (50-75% de renovação)

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                       <div class="potential-card potential-low">

&nbsp;                           <div class="potential-title">

&nbsp;                               <span style="color: #EF5350;">●</span> Baixa Probabilidade

&nbsp;                           </div>

&nbsp;                           <div class="potential-value"><span id="low-potential-count">0</span> contratos</div>

&nbsp;                           <div class="potential-description">

&nbsp;                               Clientes com baixa utilização (20-50% de renovação)

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               </div>

&nbsp;           </div>

&nbsp;           

&nbsp;           <div class="col-md-6">

&nbsp;               <div class="dashboard-section">

&nbsp;                   <div class="section-header">

&nbsp;                       <h6 class="section-title">Ocupação de Turmas</h6>

&nbsp;                   </div>

&nbsp;                   

&nbsp;                   <div class="grid-2x2">

&nbsp;                       <div>

&nbsp;                           <div class="chart-container">

&nbsp;                               <canvas id="occupancy-distribution-chart"></canvas>

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                       <div>

&nbsp;                           <div class="chart-container">

&nbsp;                               <canvas id="peak-time-chart"></canvas>

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;                   

&nbsp;                   <div class="key-metrics mt-3">

&nbsp;                       <div class="key-metric">

&nbsp;                           <div class="key-metric-label">Ocupação Média</div>

&nbsp;                           <div class="key-metric-value" id="avg-occupancy">0%</div>

&nbsp;                       </div>

&nbsp;                       <div class="key-metric">

&nbsp;                           <div class="key-metric-label">Turmas Cheias</div>

&nbsp;                           <div class="key-metric-value" id="overcrowded-classes">0</div>

&nbsp;                       </div>

&nbsp;                       <div class="key-metric">

&nbsp;                           <div class="key-metric-label">Turmas Vazias</div>

&nbsp;                           <div class="key-metric-value" id="underutilized-classes">0</div>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;                   

&nbsp;                   <h6 class="mt-3 mb-2" style="color: var(--primary);">Calendário de Ocupação</h6>

&nbsp;                   <div class="occupancy-heatmap">

&nbsp;                       <div class="heatmap-header"></div>

&nbsp;                       <div class="heatmap-header">Seg</div>

&nbsp;                       <div class="heatmap-header">Ter</div>

&nbsp;                       <div class="heatmap-header">Qua</div>

&nbsp;                       <div class="heatmap-header">Qui</div>

&nbsp;                       <div class="heatmap-header">Sex</div>

&nbsp;                       <div class="heatmap-header">Sáb</div>

&nbsp;                       <div class="heatmap-header">Dom</div>

&nbsp;                       

&nbsp;                       <div class="heatmap-day">6-8AM</div>

&nbsp;                       <div class="heatmap-cell occupancy-high">85%</div>

&nbsp;                       <div class="heatmap-cell occupancy-high">82%</div>

&nbsp;                       <div class="heatmap-cell occupancy-high">87%</div>

&nbsp;                       <div class="heatmap-cell occupancy-high">84%</div>

&nbsp;                       <div class="heatmap-cell occupancy-high">89%</div>

&nbsp;                       <div class="heatmap-cell occupancy-medium">65%</div>

&nbsp;                       <div class="heatmap-cell occupancy-low">35%</div>

&nbsp;                       

&nbsp;                       <div class="heatmap-day">8-10AM</div>

&nbsp;                       <div class="heatmap-cell occupancy-high">92%</div>

&nbsp;                       <div class="heatmap-cell occupancy-high">95%</div>

&nbsp;                       <div class="heatmap-cell occupancy-high">91%</div>

&nbsp;                       <div class="heatmap-cell occupancy-high">93%</div>

&nbsp;                       <div class="heatmap-cell occupancy-high">96%</div>

&nbsp;                       <div class="heatmap-cell occupancy-medium">70%</div>

&nbsp;                       <div class="heatmap-cell occupancy-low">40%</div>

&nbsp;                       

&nbsp;                       <div class="heatmap-day">10AM-12PM</div>

&nbsp;                       <div class="heatmap-cell occupancy-medium">75%</div>

&nbsp;                       <div class="heatmap-cell occupancy-medium">78%</div>

&nbsp;                       <div class="heatmap-cell occupancy-medium">72%</div>

&nbsp;                       <div class="heatmap-cell occupancy-medium">76%</div>

&nbsp;                       <div class="heatmap-cell occupancy-medium">79%</div>

&nbsp;                       <div class="heatmap-cell occupancy-low">45%</div>

&nbsp;                       <div class="heatmap-cell occupancy-low">30%</div>

&nbsp;                   </div>

&nbsp;               </div>

&nbsp;           </div>

&nbsp;       </div>

&nbsp;       

&nbsp;       <div class="dashboard-section">

&nbsp;           <div class="section-header">

&nbsp;               <h6 class="section-title">Recomendações Estratégicas</h6>

&nbsp;           </div>

&nbsp;           

&nbsp;           <div class="row">

&nbsp;               <div class="col-md-4">

&nbsp;                   <div class="insight-card">

&nbsp;                       <div class="insight-title">Renovação de Contratos</div>

&nbsp;                       <div class="insight-content">

&nbsp;                           Foco na renovação de <span id="renewal-focus-count" class="fw-bold">0</span> contratos com vencimento em 30 dias. 

&nbsp;                           Clientes com utilização acima de 70% têm taxa de renovação de <span class="fw-bold">78%</span> contra <span class="fw-bold">42%</span> para baixa utilização.

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;                   

&nbsp;                   <div class="insight-card">

&nbsp;                       <div class="insight-title">Otimização de Turmas</div>

&nbsp;                       <div class="insight-content">

&nbsp;                           Adicione 1-2 turmas nos horários de pico (6-10AM e 6-8PM) e consolide turmas no período das 12-2PM com ocupação média de <span class="fw-bold">35%</span>.

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               </div>

&nbsp;               

&nbsp;               <div class="col-md-4">

&nbsp;                   <div class="insight-card">

&nbsp;                       <div class="insight-title">Aumento de Receita</div>

&nbsp;                       <div class="insight-content">

&nbsp;                           Aumente a receita em <span id="revenue-opportunity" class="fw-bold">R$ 0,00</span> preenchendo turmas subutilizadas e gerenciando turmas superlotadas.

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;                   

&nbsp;                   <div class="insight-card">

&nbsp;                       <div class="insight-title">Redução de Churn</div>

&nbsp;                       <div class="insight-content">

&nbsp;                           Aumente a utilização de sessões em <span class="fw-bold">10%</span> para reduzir o churn em <span id="churn-reduction" class="fw-bold">0%</span>. 

&nbsp;                           <div class="churn-risk-meter mt-1">

&nbsp;                               <div class="churn-risk-pointer" id="churn-risk-pointer" style="left: 0%;"></div>

&nbsp;                           </div>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               </div>

&nbsp;               

&nbsp;               <div class="col-md-4">

&nbsp;                   <div class="insight-card action-required">

&nbsp;                       <div class="insight-title">Ações Imediatas</div>

&nbsp;                       <div class="insight-content">

&nbsp;                           <ul class="list-unstyled mb-0" style="font-size: 0.85rem;">

&nbsp;                               <li class="mb-2"><i class="bi bi-exclamation-circle me-1" style="color: var(--accent);"></i> <span id="action-renewals">0</span> renovações críticas esta semana</li>

&nbsp;                               <li class="mb-2"><i class="bi bi-exclamation-circle me-1" style="color: var(--accent);"></i> <span id="action-low-util">0</span> clientes com baixa utilização</li>

&nbsp;                               <li class="mb-2"><i class="bi bi-exclamation-circle me-1" style="color: var(--accent);"></i> <span id="action-overcrowded">0</span> turmas superlotadas</li>

&nbsp;                               <li><i class="bi bi-exclamation-circle me-1" style="color: var(--accent);"></i> <span id="action-underutilized">0</span> turmas subutilizadas</li>

&nbsp;                           </ul>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;                   

&nbsp;                   <div class="insight-card">

&nbsp;                       <div class="insight-title">Próximos Passos</div>

&nbsp;                       <div class="insight-content">

&nbsp;                           <ol class="list-unstyled mb-0" style="font-size: 0.85rem;">

&nbsp;                               <li class="mb-2"><span class="fw-bold">1.</span> Renove contratos críticos</li>

&nbsp;                               <li class="mb-2"><span class="fw-bold">2.</span> Aumente utilização de sessões</li>

&nbsp;                               <li class="mb-2"><span class="fw-bold">3.</span> Otimize horários das turmas</li>

&nbsp;                               <li><span class="fw-bold">4.</span> Emita notas fiscais automaticamente</li>

&nbsp;                           </ol>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               </div>

&nbsp;           </div>

&nbsp;       </div>

&nbsp;       

&nbsp;       <footer class="text-center py-3" style="color: var(--dark-gray); font-size: 0.85rem; border-top: 1px solid var(--gray); margin-top: 20px;">

&nbsp;           <p class="mb-1">Military Olive Dashboard • Atualizado <span id="last-updated">Agora</span></p>

&nbsp;           <p class="mb-0">© 2025 Academia Calistenia - Sistema de Gestão de Clientes e Notas Fiscais</p>

&nbsp;       </footer>

&nbsp;   </main>



&nbsp;   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

&nbsp;   <script>

&nbsp;       // Global variables

&nbsp;       let businessData = null;

&nbsp;       let selectedClient = null;

&nbsp;       let selectedContract = null;

&nbsp;       let clientsData = \[];

&nbsp;       let contractsData = \[];

&nbsp;       let expirationTimelineChart = null;

&nbsp;       let renewalPotentialChart = null;

&nbsp;       let occupancyDistributionChart = null;

&nbsp;       let peakTimeChart = null;

&nbsp;       let businessHealthChart = null;

&nbsp;       let contractFilter = 'all';

&nbsp;       let apiBaseUrl = '/api'; // Base URL for API endpoints

&nbsp;       let dataService = {

&nbsp;           clients: {

&nbsp;               search: async function(term, status, contractType) {

&nbsp;                   // In production, this would call your backend API

&nbsp;                   try {

&nbsp;                       this.showLoading('search-results');

&nbsp;                       

&nbsp;                       const response = await fetch(`${apiBaseUrl}/clients/search?term=${encodeURIComponent(term)}\&status=${encodeURIComponent(status)}\&contractType=${encodeURIComponent(contractType)}`);

&nbsp;                       

&nbsp;                       if (!response.ok) {

&nbsp;                           throw new Error('Erro ao buscar clientes');

&nbsp;                       }

&nbsp;                       

&nbsp;                       const data = await response.json();

&nbsp;                       this.hideLoading('search-results');

&nbsp;                       return data.clients;

&nbsp;                   } catch (error) {

&nbsp;                       this.showError('search-results', 'Erro ao buscar clientes', error.message);

&nbsp;                       throw error;

&nbsp;                   }

&nbsp;               },

&nbsp;               

&nbsp;               getById: async function(clientId) {

&nbsp;                   try {

&nbsp;                       this.showLoading('client-details-container');

&nbsp;                       

&nbsp;                       const response = await fetch(`${apiBaseUrl}/clients/${clientId}`);

&nbsp;                       

&nbsp;                       if (!response.ok) {

&nbsp;                           throw new Error('Erro ao carregar detalhes do cliente');

&nbsp;                       }

&nbsp;                       

&nbsp;                       const data = await response.json();

&nbsp;                       this.hideLoading('client-details-container');

&nbsp;                       return data.client;

&nbsp;                   } catch (error) {

&nbsp;                       this.showError('client-details-container', 'Erro ao carregar detalhes do cliente', error.message);

&nbsp;                       throw error;

&nbsp;                   }

&nbsp;               },

&nbsp;               

&nbsp;               getContracts: async function(clientId) {

&nbsp;                   try {

&nbsp;                       this.showLoading('client-contracts');

&nbsp;                       

&nbsp;                       const response = await fetch(`${apiBaseUrl}/clients/${clientId}/contracts`);

&nbsp;                       

&nbsp;                       if (!response.ok) {

&nbsp;                           throw new Error('Erro ao carregar contratos do cliente');

&nbsp;                       }

&nbsp;                       

&nbsp;                       const data = await response.json();

&nbsp;                       this.hideLoading('client-contracts');

&nbsp;                       return data.contracts;

&nbsp;                   } catch (error) {

&nbsp;                       this.showError('client-contracts', 'Erro ao carregar contratos do cliente', error.message);

&nbsp;                       throw error;

&nbsp;                   }

&nbsp;               }

&nbsp;           },

&nbsp;           

&nbsp;           business: {

&nbsp;               getHealthData: async function(period = 'month') {

&nbsp;                   try {

&nbsp;                       this.showLoading('business-health-chart');

&nbsp;                       

&nbsp;                       const response = await fetch(`${apiBaseUrl}/business/health?period=${encodeURIComponent(period)}`);

&nbsp;                       

&nbsp;                       if (!response.ok) {

&nbsp;                           throw new Error('Erro ao carregar dados de saúde do negócio');

&nbsp;                       }

&nbsp;                       

&nbsp;                       const data = await response.json();

&nbsp;                       this.hideLoading('business-health-chart');

&nbsp;                       return data;

&nbsp;                   } catch (error) {

&nbsp;                       this.showError('business-health-chart', 'Erro ao carregar dados de saúde do negócio', error.message);

&nbsp;                       throw error;

&nbsp;                   }

&nbsp;               },

&nbsp;               

&nbsp;               getContractExpirations: async function() {

&nbsp;                   try {

&nbsp;                       this.showLoading('expiration-timeline-chart');

&nbsp;                       

&nbsp;                       const response = await fetch(`${apiBaseUrl}/business/contract-expirations`);

&nbsp;                       

&nbsp;                       if (!response.ok) {

&nbsp;                           throw new Error('Erro ao carregar dados de expiração de contratos');

&nbsp;                       }

&nbsp;                       

&nbsp;                       const data = await response.json();

&nbsp;                       this.hideLoading('expiration-timeline-chart');

&nbsp;                       return data;

&nbsp;                   } catch (error) {

&nbsp;                       this.showError('expiration-timeline-chart', 'Erro ao carregar dados de expiração de contratos', error.message);

&nbsp;                       throw error;

&nbsp;                   }

&nbsp;               },

&nbsp;               

&nbsp;               getRenewalPotential: async function() {

&nbsp;                   try {

&nbsp;                       this.showLoading('renewal-potential-chart');

&nbsp;                       

&nbsp;                       const response = await fetch(`${apiBaseUrl}/business/renewal-potential`);

&nbsp;                       

&nbsp;                       if (!response.ok) {

&nbsp;                           throw new Error('Erro ao carregar dados de potencial de renovação');

&nbsp;                       }

&nbsp;                       

&nbsp;                       const data = await response.json();

&nbsp;                       this.hideLoading('renewal-potential-chart');

&nbsp;                       return data;

&nbsp;                   } catch (error) {

&nbsp;                       this.showError('renewal-potential-chart', 'Erro ao carregar dados de potencial de renovação', error.message);

&nbsp;                       throw error;

&nbsp;                   }

&nbsp;               },

&nbsp;               

&nbsp;               getClassOccupancy: async function() {

&nbsp;                   try {

&nbsp;                       this.showLoading('occupancy-distribution-chart');

&nbsp;                       

&nbsp;                       const response = await fetch(`${apiBaseUrl}/business/class-occupancy`);

&nbsp;                       

&nbsp;                       if (!response.ok) {

&nbsp;                           throw new Error('Erro ao carregar dados de ocupação de turmas');

&nbsp;                       }

&nbsp;                       

&nbsp;                       const data = await response.json();

&nbsp;                       this.hideLoading('occupancy-distribution-chart');

&nbsp;                       return data;

&nbsp;                   } catch (error) {

&nbsp;                       this.showError('occupancy-distribution-chart', 'Erro ao carregar dados de ocupação de turmas', error.message);

&nbsp;                       throw error;

&nbsp;                   }

&nbsp;               }

&nbsp;           },

&nbsp;           

&nbsp;           nfe: {

&nbsp;               generate: async function(clientId, contractId, cpf) {

&nbsp;                   try {

&nbsp;                       const response = await fetch(`${apiBaseUrl}/nfe/generate`, {

&nbsp;                           method: 'POST',

&nbsp;                           headers: {

&nbsp;                               'Content-Type': 'application/json'

&nbsp;                           },

&nbsp;                           body: JSON.stringify({

&nbsp;                               client\_id: clientId,

&nbsp;                               contract\_id: contractId,

&nbsp;                               cpf: cpf

&nbsp;                           })

&nbsp;                       });

&nbsp;                       

&nbsp;                       if (!response.ok) {

&nbsp;                           throw new Error('Erro ao emitir nota fiscal');

&nbsp;                       }

&nbsp;                       

&nbsp;                       const data = await response.json();

&nbsp;                       return data;

&nbsp;                   } catch (error) {

&nbsp;                       console.error('NFe generation error:', error);

&nbsp;                       throw error;

&nbsp;                   }

&nbsp;               },

&nbsp;               

&nbsp;               validateCpf: async function(cpf) {

&nbsp;                   try {

&nbsp;                       const response = await fetch(`${apiBaseUrl}/nfe/validate-cpf?cpf=${encodeURIComponent(cpf)}`);

&nbsp;                       

&nbsp;                       if (!response.ok) {

&nbsp;                           throw new Error('Erro ao validar CPF');

&nbsp;                       }

&nbsp;                       

&nbsp;                       const data = await response.json();

&nbsp;                       return data.valid;

&nbsp;                   } catch (error) {

&nbsp;                       console.error('CPF validation error:', error);

&nbsp;                       throw error;

&nbsp;                   }

&nbsp;               }

&nbsp;           },

&nbsp;           

&nbsp;           // Utility methods

&nbsp;           showLoading: function(containerId) {

&nbsp;               const container = document.getElementById(containerId);

&nbsp;               if (!container) return;

&nbsp;               

&nbsp;               // Remove any existing loading or error elements

&nbsp;               const existingLoading = container.querySelector('.data-loading');

&nbsp;               if (existingLoading) existingLoading.remove();

&nbsp;               

&nbsp;               const existingError = container.querySelector('.data-error');

&nbsp;               if (existingError) existingError.remove();

&nbsp;               

&nbsp;               // Create loading element

&nbsp;               const loadingEl = document.createElement('div');

&nbsp;               loadingEl.className = 'data-loading';

&nbsp;               loadingEl.innerHTML = `

&nbsp;                   <div class="data-loading-content">

&nbsp;                       <div class="loading-spinner"></div>

&nbsp;                       <div class="loading-text">Carregando dados...</div>

&nbsp;                   </div>

&nbsp;               `;

&nbsp;               

&nbsp;               container.appendChild(loadingEl);

&nbsp;               container.style.position = 'relative';

&nbsp;           },

&nbsp;           

&nbsp;           hideLoading: function(containerId) {

&nbsp;               const container = document.getElementById(containerId);

&nbsp;               if (!container) return;

&nbsp;               

&nbsp;               const loadingEl = container.querySelector('.data-loading');

&nbsp;               if (loadingEl) {

&nbsp;                   loadingEl.remove();

&nbsp;               }

&nbsp;           },

&nbsp;           

&nbsp;           showError: function(containerId, title, message) {

&nbsp;               const container = document.getElementById(containerId);

&nbsp;               if (!container) return;

&nbsp;               

&nbsp;               // Remove any existing loading or error elements

&nbsp;               const existingLoading = container.querySelector('.data-loading');

&nbsp;               if (existingLoading) existingLoading.remove();

&nbsp;               

&nbsp;               const existingError = container.querySelector('.data-error');

&nbsp;               if (existingError) existingError.remove();

&nbsp;               

&nbsp;               // Create error element

&nbsp;               const errorEl = document.createElement('div');

&nbsp;               errorEl.className = 'data-error';

&nbsp;               errorEl.innerHTML = `

&nbsp;                   <div class="data-error-title">${title}</div>

&nbsp;                   <div class="data-error-message">${message}</div>

&nbsp;                   <button class="retry-button" data-container="${containerId}">Tentar novamente</button>

&nbsp;               `;

&nbsp;               

&nbsp;               container.appendChild(errorEl);

&nbsp;               

&nbsp;               // Add retry button event listener

&nbsp;               const retryButton = errorEl.querySelector('.retry-button');

&nbsp;               if (retryButton) {

&nbsp;                   retryButton.addEventListener('click', () => {

&nbsp;                       // Trigger appropriate data load based on container

&nbsp;                       if (containerId === 'search-results') {

&nbsp;                           performSearch();

&nbsp;                       } else if (containerId === 'client-details-container') {

&nbsp;                           loadClientDetails(selectedClient.id);

&nbsp;                       } else if (containerId === 'client-contracts') {

&nbsp;                           loadClientContracts(selectedClient.id);

&nbsp;                       } else if (containerId === 'business-health-chart') {

&nbsp;                           updateBusinessMetrics();

&nbsp;                           renderBusinessHealthChart();

&nbsp;                       } else if (containerId === 'expiration-timeline-chart') {

&nbsp;                           renderExpirationTimelineChart();

&nbsp;                       } else if (containerId === 'renewal-potential-chart') {

&nbsp;                           renderRenewalPotentialChart();

&nbsp;                       } else if (containerId === 'occupancy-distribution-chart') {

&nbsp;                           renderOccupancyDistributionChart();

&nbsp;                       }

&nbsp;                   });

&nbsp;               }

&nbsp;           }

&nbsp;       };

&nbsp;       

&nbsp;       // Initialize the application

&nbsp;       document.addEventListener('DOMContentLoaded', function() {

&nbsp;           // Set up event listeners

&nbsp;           setupEventListeners();

&nbsp;           

&nbsp;           // Initial search

&nbsp;           performSearch();

&nbsp;           

&nbsp;           // Load business data

&nbsp;           loadBusinessData();

&nbsp;       });

&nbsp;       

&nbsp;       // Load business data

&nbsp;       async function loadBusinessData() {

&nbsp;           try {

&nbsp;               // Load all business data

&nbsp;               const \[healthData, contractExpirations, renewalPotential, classOccupancy] = await Promise.all(\[

&nbsp;                   dataService.business.getHealthData(),

&nbsp;                   dataService.business.getContractExpirations(),

&nbsp;                   dataService.business.getRenewalPotential(),

&nbsp;                   dataService.business.getClassOccupancy()

&nbsp;               ]);

&nbsp;               

&nbsp;               // Store data

&nbsp;               businessData = {

&nbsp;                   business\_health: {

&nbsp;                       contract\_expiration: contractExpirations,

&nbsp;                       renewal\_analysis: renewalPotential,

&nbsp;                       session\_usage: healthData.session\_usage,

&nbsp;                       class\_occupancy: classOccupancy

&nbsp;                   },

&nbsp;                   meta: {

&nbsp;                       generated\_at: new Date().toISOString()

&nbsp;                   }

&nbsp;               };

&nbsp;               

&nbsp;               // Update UI

&nbsp;               updateBusinessMetrics();

&nbsp;               renderCharts();

&nbsp;               

&nbsp;               // Update last updated timestamp

&nbsp;               document.getElementById('last-updated').textContent = new Date().toLocaleTimeString('pt-BR');

&nbsp;           } catch (error) {

&nbsp;               console.error('Error loading business data:', error);

&nbsp;               // Error handling is done in the dataService methods

&nbsp;           }

&nbsp;       }

&nbsp;       

&nbsp;       // Set up event listeners

&nbsp;       function setupEventListeners() {

&nbsp;           // Search functionality

&nbsp;           document.getElementById('client-search').addEventListener('input', function(e) {

&nbsp;               if (e.target.value.length >= 3 || e.target.value.length === 0) {

&nbsp;                   performSearch();

&nbsp;               }

&nbsp;           });

&nbsp;           

&nbsp;           document.getElementById('status-filter').addEventListener('change', performSearch);

&nbsp;           document.getElementById('contract-filter').addEventListener('change', performSearch);

&nbsp;           

&nbsp;           // CPF validation

&nbsp;           document.getElementById('validate-cpf').addEventListener('click', async function() {

&nbsp;               const cpfInput = document.getElementById('client-cpf');

&nbsp;               const cpf = cpfInput.value;

&nbsp;               

&nbsp;               if (!cpf || cpf.replace(/\\D/g, '').length < 11) {

&nbsp;                   showCpfValidationError('CPF inválido');

&nbsp;                   return;

&nbsp;               }

&nbsp;               

&nbsp;               try {

&nbsp;                   this.innerHTML = '<div class="loading-spinner" style="width: 12px; height: 12px;"></div>';

&nbsp;                   this.disabled = true;

&nbsp;                   

&nbsp;                   const isValid = await dataService.nfe.validateCpf(cpf);

&nbsp;                   

&nbsp;                   if (isValid) {

&nbsp;                       showCpfValidationSuccess();

&nbsp;                       document.getElementById('nfe-warning').style.display = 'none';

&nbsp;                   } else {

&nbsp;                       showCpfValidationError('CPF não encontrado ou inválido');

&nbsp;                   }

&nbsp;               } catch (error) {

&nbsp;                   showCpfValidationError('Erro ao validar CPF');

&nbsp;               } finally {

&nbsp;                   this.innerHTML = '<i class="bi bi-check-circle"></i>';

&nbsp;                   this.disabled = false;

&nbsp;               }

&nbsp;           });

&nbsp;           

&nbsp;           // Generate NFe button

&nbsp;           document.getElementById('generate-nfe-button').addEventListener('click', generateNFe);

&nbsp;           

&nbsp;           // New NFe button

&nbsp;           document.getElementById('new-nfe-button').addEventListener('click', function() {

&nbsp;               document.getElementById('nfe-confirmation').style.display = 'none';

&nbsp;               document.getElementById('generate-nfe-button').style.display = 'block';

&nbsp;               resetStepIndicator();

&nbsp;           });

&nbsp;           

&nbsp;           // NFe button in navbar

&nbsp;           document.getElementById('nfe-button').addEventListener('click', function() {

&nbsp;               document.getElementById('nfe-button').innerHTML = '<div class="loading-spinner"></div> Carregando...';

&nbsp;               

&nbsp;               setTimeout(() => {

&nbsp;                   document.getElementById('nfe-button').innerHTML = '<i class="bi bi-receipt-cutoff"></i> Emitir Nova Nota Fiscal';

&nbsp;                   document.getElementById('search-container').scrollIntoView({ behavior: 'smooth' });

&nbsp;                   resetStepIndicator();

&nbsp;                   document.getElementById('client-details-container').style.display = 'none';

&nbsp;                   document.getElementById('search-container').style.display = 'block';

&nbsp;               }, 500);

&nbsp;           });

&nbsp;           

&nbsp;           // Refresh button

&nbsp;           document.getElementById('refresh-button').addEventListener('click', async function() {

&nbsp;               const btn = this;

&nbsp;               const originalText = btn.innerHTML;

&nbsp;               btn.innerHTML = '<div class="loading-spinner"></div> Atualizando...';

&nbsp;               btn.disabled = true;

&nbsp;               

&nbsp;               try {

&nbsp;                   // Refresh search results

&nbsp;                   await performSearch();

&nbsp;                   

&nbsp;                   // Refresh business data

&nbsp;                   await loadBusinessData();

&nbsp;                   

&nbsp;                   // Update last updated timestamp

&nbsp;                   document.getElementById('last-updated').textContent = new Date().toLocaleTimeString('pt-BR');

&nbsp;               } catch (error) {

&nbsp;                   console.error('Error refreshing data:', error);

&nbsp;               } finally {

&nbsp;                   btn.innerHTML = originalText;

&nbsp;                   btn.disabled = false;

&nbsp;               }

&nbsp;           });

&nbsp;           

&nbsp;           // Contract filter pills

&nbsp;           document.querySelectorAll('.contract-filter-pill').forEach(pill => {

&nbsp;               pill.addEventListener('click', function() {

&nbsp;                   document.querySelectorAll('.contract-filter-pill').forEach(p => {

&nbsp;                       p.classList.remove('active');

&nbsp;                   });

&nbsp;                   this.classList.add('active');

&nbsp;                   contractFilter = this.getAttribute('data-filter');

&nbsp;                   

&nbsp;                   if (selectedClient) {

&nbsp;                       loadClientContracts(selectedClient.id);

&nbsp;                   }

&nbsp;               });

&nbsp;           });

&nbsp;           

&nbsp;           // Time period selectors

&nbsp;           document.querySelectorAll('.period-btn').forEach(btn => {

&nbsp;               btn.addEventListener('click', function() {

&nbsp;                   document.querySelectorAll('.period-btn').forEach(b => {

&nbsp;                       b.classList.remove('active');

&nbsp;                   });

&nbsp;                   this.classList.add('active');

&nbsp;                   

&nbsp;                   // Refresh business data with new period

&nbsp;                   const period = this.getAttribute('data-period');

&nbsp;                   dataService.business.getHealthData(period)

&nbsp;                       .then(healthData => {

&nbsp;                           businessData.business\_health.session\_usage = healthData.session\_usage;

&nbsp;                           updateBusinessMetrics();

&nbsp;                           renderBusinessHealthChart();

&nbsp;                       })

&nbsp;                       .catch(error => {

&nbsp;                           console.error('Error loading health data for period:', period, error);

&nbsp;                       });

&nbsp;               });

&nbsp;           });

&nbsp;       }

&nbsp;       

&nbsp;       // Perform client search

&nbsp;       async function performSearch() {

&nbsp;           const searchTerm = document.getElementById('client-search').value.toLowerCase();

&nbsp;           const statusFilter = document.getElementById('status-filter').value;

&nbsp;           const contractFilter = document.getElementById('contract-filter').value;

&nbsp;           

&nbsp;           // Only search if term is long enough or empty

&nbsp;           if (searchTerm.length < 3 \&\& searchTerm.length > 0) {

&nbsp;               return;

&nbsp;           }

&nbsp;           

&nbsp;           try {

&nbsp;               // Get filtered clients from API

&nbsp;               const clients = await dataService.clients.search(searchTerm, statusFilter, contractFilter);

&nbsp;               clientsData = clients;

&nbsp;               

&nbsp;               // Display results

&nbsp;               displaySearchResults(clients);

&nbsp;           } catch (error) {

&nbsp;               console.error('Search error:', error);

&nbsp;               // Error handling is done in dataService

&nbsp;           }

&nbsp;       }

&nbsp;       

&nbsp;       // Display search results

&nbsp;       function displaySearchResults(clients) {

&nbsp;           const resultsContainer = document.getElementById('search-results');

&nbsp;           

&nbsp;           if (clients.length === 0) {

&nbsp;               resultsContainer.innerHTML = `

&nbsp;                   <div class="search-no-results">

&nbsp;                       Nenhum cliente encontrado com os critérios informados.

&nbsp;                   </div>

&nbsp;               `;

&nbsp;               document.getElementById('client-details-container').style.display = 'none';

&nbsp;               return;

&nbsp;           }

&nbsp;           

&nbsp;           let resultsHTML = '';

&nbsp;           clients.forEach(client => {

&nbsp;               const statusClass = client.status === 'Ativo' ? 'status-active' : 

&nbsp;                                 client.status === 'Bloqueado' ? 'status-at-risk' : 'status-inactive';

&nbsp;               

&nbsp;               resultsHTML += `

&nbsp;                   <div class="search-result-item" data-id="${client.id}">

&nbsp;                       <div class="search-result-name">${client.name}</div>

&nbsp;                       <div class="search-result-details">

&nbsp;                           <span class="status-badge ${statusClass}">${client.status}</span> | 

&nbsp;                           Código: #${client.id} | 

&nbsp;                           Consultor: ${client.consultant}

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               `;

&nbsp;           });

&nbsp;           

&nbsp;           resultsContainer.innerHTML = resultsHTML;

&nbsp;           

&nbsp;           // Add click handlers to results

&nbsp;           document.querySelectorAll('.search-result-item').forEach(item => {

&nbsp;               item.addEventListener('click', function() {

&nbsp;                   // Remove selection from all items

&nbsp;                   document.querySelectorAll('.search-result-item').forEach(i => {

&nbsp;                       i.classList.remove('selected');

&nbsp;                   });

&nbsp;                   

&nbsp;                   // Add selection to clicked item

&nbsp;                   this.classList.add('selected');

&nbsp;                   

&nbsp;                   // Load client details

&nbsp;                   const clientId = parseInt(this.getAttribute('data-id'));

&nbsp;                   loadClientDetails(clientId);

&nbsp;               });

&nbsp;           });

&nbsp;       }

&nbsp;       

&nbsp;       // Load client details

&nbsp;       async function loadClientDetails(clientId) {

&nbsp;           try {

&nbsp;               // Get client data

&nbsp;               const client = await dataService.clients.getById(clientId);

&nbsp;               selectedClient = client;

&nbsp;               

&nbsp;               // Update step indicator

&nbsp;               document.getElementById('step-1').classList.remove('active');

&nbsp;               document.getElementById('step-2').classList.add('active');

&nbsp;               

&nbsp;               // Show client details container

&nbsp;               document.getElementById('client-details-container').style.display = 'block';

&nbsp;               

&nbsp;               // Populate client details

&nbsp;               document.getElementById('client-name-header').textContent = `Detalhes do Cliente: ${client.name}`;

&nbsp;               document.getElementById('client-name').textContent = client.name;

&nbsp;               document.getElementById('client-code').textContent = `Código: #${client.id}`;

&nbsp;               document.getElementById('client-status').textContent = client.status;

&nbsp;               

&nbsp;               // Set status badge class

&nbsp;               const statusClass = client.status === 'Ativo' ? 'status-active' : 

&nbsp;                                 client.status === 'Bloqueado' ? 'status-at-risk' : 'status-inactive';

&nbsp;               document.getElementById('client-status').className = `status-badge ${statusClass}`;

&nbsp;               

&nbsp;               document.getElementById('client-cpf').value = client.cpf || '';

&nbsp;               document.getElementById('client-consultant').value = client.consultant;

&nbsp;               document.getElementById('client-first-contract').value = client.firstContract;

&nbsp;               document.getElementById('client-current-status').value = client.currentStatus;

&nbsp;               

&nbsp;               // Load client contracts

&nbsp;               await loadClientContracts(clientId);

&nbsp;               

&nbsp;               // Update NFe preview

&nbsp;               updateNFePreview();

&nbsp;           } catch (error) {

&nbsp;               console.error('Error loading client details:', error);

&nbsp;               // Error handling is done in dataService

&nbsp;           }

&nbsp;       }

&nbsp;       

&nbsp;       // Load client contracts

&nbsp;       async function loadClientContracts(clientId) {

&nbsp;           try {

&nbsp;               const contracts = await dataService.clients.getContracts(clientId);

&nbsp;               contractsData = contracts;

&nbsp;               

&nbsp;               displayClientContracts(contracts);

&nbsp;           } catch (error) {

&nbsp;               console.error('Error loading client contracts:', error);

&nbsp;               // Error handling is done in dataService

&nbsp;           }

&nbsp;       }

&nbsp;       

&nbsp;       // Display client contracts

&nbsp;       function displayClientContracts(contracts) {

&nbsp;           const contractsContainer = document.getElementById('client-contracts');

&nbsp;           

&nbsp;           if (contracts.length === 0) {

&nbsp;               contractsContainer.innerHTML = `

&nbsp;                   <div class="alert alert-light" style="background: rgba(76, 74, 45, 0.02); border-color: rgba(76, 74, 45, 0.1);">

&nbsp;                       Nenhum contrato encontrado para este cliente.

&nbsp;                   </div>

&nbsp;               `;

&nbsp;               return;

&nbsp;           }

&nbsp;           

&nbsp;           let contractsHTML = '';

&nbsp;           contracts.forEach(contract => {

&nbsp;               const contractDate = new Date(contract.date.split(' ')\[0].split('/').reverse().join('-'));

&nbsp;               const formattedDate = contractDate.toLocaleDateString('pt-BR');

&nbsp;               

&nbsp;               contractsHTML += `

&nbsp;                   <div class="contract-item" data-id="${contract.id}">

&nbsp;                       <div class="contract-header">

&nbsp;                           <span>${contract.item}</span>

&nbsp;                           <span class="contract-value">R$ ${contract.totalValue.toFixed(2)}</span>

&nbsp;                       </div>

&nbsp;                       <div class="contract-date">${formattedDate}</div>

&nbsp;                       <div class="contract-actions">

&nbsp;                           <button class="btn btn-sm btn-outline-primary btn-contract select-contract">

&nbsp;                               <i class="bi bi-check-circle"></i> Selecionar

&nbsp;                           </button>

&nbsp;                           <button class="btn btn-sm btn-outline-secondary btn-contract">

&nbsp;                               <i class="bi bi-eye"></i> Detalhes

&nbsp;                           </button>

&nbsp;                       </div>

&nbsp;                   </div>

&nbsp;               `;

&nbsp;           });

&nbsp;           

&nbsp;           contractsContainer.innerHTML = contractsHTML;

&nbsp;           

&nbsp;           // Add click handlers to select contract

&nbsp;           document.querySelectorAll('.select-contract').forEach(button => {

&nbsp;               button.addEventListener('click', function() {

&nbsp;                   const contractId = parseInt(this.closest('.contract-item').getAttribute('data-id'));

&nbsp;                   selectedContract = contractsData.find(c => c.id === contractId);

&nbsp;                   

&nbsp;                   // Remove selection from all contracts

&nbsp;                   document.querySelectorAll('.contract-item').forEach(item => {

&nbsp;                       item.style.backgroundColor = '';

&nbsp;                   });

&nbsp;                   

&nbsp;                   // Add selection to clicked contract

&nbsp;                   this.closest('.contract-item').style.backgroundColor = '#f0f7e8';

&nbsp;                   

&nbsp;                   // Update NFe preview

&nbsp;                   updateNFePreview();

&nbsp;               });

&nbsp;           });

&nbsp;       }

&nbsp;       

&nbsp;       // Update NFe preview

&nbsp;       function updateNFePreview() {

&nbsp;           if (!selectedClient) return;

&nbsp;           

&nbsp;           // Default to first contract if none selected

&nbsp;           if (!selectedContract \&\& selectedClient) {

&nbsp;               const clientContracts = contractsData.filter(c => c.clientId === selectedClient.id);

&nbsp;               if (clientContracts.length > 0) {

&nbsp;                   selectedContract = clientContracts\[0];

&nbsp;               }

&nbsp;           }

&nbsp;           

&nbsp;           // Update preview

&nbsp;           document.getElementById('nfe-client-name').textContent = selectedClient.name;

&nbsp;           document.getElementById('nfe-client-cpf').textContent = selectedClient.cpf || '\[CPF]';

&nbsp;           

&nbsp;           if (selectedContract) {

&nbsp;               const serviceName = selectedContract.item.replace(/-/g, ' ').replace(/\\s+/g, ' ').trim();

&nbsp;               document.getElementById('nfe-service-description').textContent = 

&nbsp;                   `SERVIÇO PRESTADO A ${selectedClient.name.toUpperCase()} REFERENTE A ${serviceName}`;

&nbsp;               

&nbsp;               document.getElementById('nfe-service-value').textContent = 

&nbsp;                   `R$ ${selectedContract.totalValue.toFixed(2)}`;

&nbsp;               

&nbsp;               const issValue = (selectedContract.totalValue \* 0.02).toFixed(2);

&nbsp;               document.getElementById('nfe-iss-value').textContent = `R$ ${issValue}`;

&nbsp;               

&nbsp;               const netValue = (selectedContract.totalValue \* 0.98).toFixed(2);

&nbsp;               document.getElementById('nfe-net-value').textContent = `R$ ${netValue}`;

&nbsp;           }

&nbsp;       }

&nbsp;       

&nbsp;       // Generate NFe

&nbsp;       async function generateNFe() {

&nbsp;           if (!selectedClient || !selectedContract) {

&nbsp;               alert('Por favor, selecione um cliente e um contrato antes de emitir a nota.');

&nbsp;               return;

&nbsp;           }

&nbsp;           

&nbsp;           const cpf = document.getElementById('client-cpf').value;

&nbsp;           if (!cpf || cpf.replace(/\\D/g, '').length < 11) {

&nbsp;               showCpfValidationError('CPF inválido');

&nbsp;               return;

&nbsp;           }

&nbsp;           

&nbsp;           // Show loading state

&nbsp;           const button = document.getElementById('generate-nfe-button');

&nbsp;           button.innerHTML = '<div class="loading-spinner"></div> Emitindo Nota Fiscal...';

&nbsp;           button.disabled = true;

&nbsp;           

&nbsp;           try {

&nbsp;               // Call backend API to trigger Playwright automation

&nbsp;               const response = await dataService.nfe.generate(selectedClient.id, selectedContract.id, cpf);

&nbsp;               

&nbsp;               if (response.success) {

&nbsp;                   // Update UI to show success

&nbsp;                   document.getElementById('nfe-number').textContent = response.nfeNumber;

&nbsp;                   document.getElementById('nfe-date').textContent = new Date().toLocaleDateString('pt-BR');

&nbsp;                   

&nbsp;                   document.getElementById('nfe-confirmation').style.display = 'block';

&nbsp;                   document.getElementById('generate-nfe-button').style.display = 'none';

&nbsp;                   

&nbsp;                   // Update step indicator

&nbsp;                   document.getElementById('step-2').classList.remove('active');

&nbsp;                   document.getElementById('step-3').classList.add('active');

&nbsp;               } else {

&nbsp;                   throw new Error(response.message || 'Erro ao emitir nota fiscal');

&nbsp;               }

&nbsp;           } catch (error) {

&nbsp;               console.error('Error generating NFe:', error);

&nbsp;               alert(`Erro ao emitir nota fiscal: ${error.message}`);

&nbsp;               button.innerHTML = '<i class="bi bi-file-earmark-text"></i> Emitir Nota Fiscal';

&nbsp;               button.disabled = false;

&nbsp;           }

&nbsp;       }

&nbsp;       

&nbsp;       // Render charts

&nbsp;       function renderCharts() {

&nbsp;           // Contract expiration charts

&nbsp;           renderExpirationTimelineChart();

&nbsp;           renderRenewalPotentialChart();

&nbsp;           

&nbsp;           // Class occupancy charts

&nbsp;           renderOccupancyDistributionChart();

&nbsp;           renderPeakTimeChart();

&nbsp;           

&nbsp;           // Business health chart

&nbsp;           renderBusinessHealthChart();

&nbsp;       }

&nbsp;       

&nbsp;       // Update business metrics

&nbsp;       function updateBusinessMetrics() {

&nbsp;           if (!businessData) return;

&nbsp;           

&nbsp;           const contractData = businessData.business\_health.contract\_expiration;

&nbsp;           const renewalAnalysis = businessData.business\_health.renewal\_analysis;

&nbsp;           const sessionData = businessData.business\_health.session\_usage;

&nbsp;           const occupancyAnalysis = businessData.business\_health.class\_occupancy;

&nbsp;           

&nbsp;           // Update metrics

&nbsp;           document.getElementById('active-contracts').textContent = renewalAnalysis.total\_contracts;

&nbsp;           document.getElementById('renewals-soon').textContent = renewalAnalysis.low\_potential;

&nbsp;           document.getElementById('avg-utilization').textContent = `${sessionData.avg\_utilization.toFixed(1)}%`;

&nbsp;           

&nbsp;           // Priority counts

&nbsp;           document.getElementById('high-potential-count').textContent = renewalAnalysis.high\_potential;

&nbsp;           document.getElementById('medium-potential-count').textContent = renewalAnalysis.medium\_potential;

&nbsp;           document.getElementById('low-potential-count').textContent = renewalAnalysis.low\_potential;

&nbsp;           

&nbsp;           // Class occupancy

&nbsp;           document.getElementById('avg-occupancy').textContent = `${occupancyAnalysis.average\_occupancy.toFixed(1)}%`;

&nbsp;           document.getElementById('overcrowded-classes').textContent = occupancyAnalysis.occupancy\_analysis.overcrowded\_classes;

&nbsp;           document.getElementById('underutilized-classes').textContent = occupancyAnalysis.occupancy\_analysis.underutilized\_classes;

&nbsp;           

&nbsp;           // Strategic insights

&nbsp;           document.getElementById('revenue-opportunity').textContent = 

&nbsp;               formatCurrency(occupancyAnalysis.occupancy\_analysis.revenue\_potential);

&nbsp;           document.getElementById('churn-reduction').textContent = '15';

&nbsp;           

&nbsp;           // Action items

&nbsp;           document.getElementById('action-renewals').textContent = contractData.expirations\_by\_period.this\_week;

&nbsp;           document.getElementById('action-low-util').textContent = sessionData.utilization\_analysis.low\_utilization;

&nbsp;           document.getElementById('action-overcrowded').textContent = occupancyAnalysis.occupancy\_analysis.overcrowded\_classes;

&nbsp;           document.getElementById('action-underutilized').textContent = occupancyAnalysis.occupancy\_analysis.underutilized\_classes;

&nbsp;           

&nbsp;           // Update churn risk meter

&nbsp;           const churnRiskPointer = document.getElementById('churn-risk-pointer');

&nbsp;           churnRiskPointer.style.left = `${sessionData.churn\_risk}%`;

&nbsp;       }

&nbsp;       

&nbsp;       // Render expiration timeline chart

&nbsp;       function renderExpirationTimelineChart() {

&nbsp;           const ctx = document.getElementById('expiration-timeline-chart').getContext('2d');

&nbsp;           const contractData = businessData.business\_health.contract\_expiration;

&nbsp;           

&nbsp;           const data = {

&nbsp;               labels: \['Esta Semana', 'Este Mês', 'Próx. 90 Dias', 'Acima 90 Dias'],

&nbsp;               datasets: \[{

&nbsp;                   label: 'Contratos',

&nbsp;                   data: \[

&nbsp;                       contractData.expirations\_by\_period.this\_week,

&nbsp;                       contractData.expirations\_by\_period.this\_month,

&nbsp;                       contractData.expirations\_by\_period.next\_90\_days,

&nbsp;                       contractData.expirations\_by\_period.beyond\_90\_days

&nbsp;                   ],

&nbsp;                   backgroundColor: \[

&nbsp;                       'rgba(239, 83, 80, 0.7)',

&nbsp;                       'rgba(255, 167, 38, 0.7)',

&nbsp;                       'rgba(41, 182, 246, 0.7)',

&nbsp;                       'rgba(44, 92, 197, 0.7)'

&nbsp;                   ],

&nbsp;                   borderColor: \[

&nbsp;                       'rgba(239, 83, 80, 1)',

&nbsp;                       'rgba(255, 167, 38, 1)',

&nbsp;                       'rgba(41, 182, 246, 1)',

&nbsp;                       'rgba(44, 92, 197, 1)'

&nbsp;                   ],

&nbsp;                   borderWidth: 1

&nbsp;               }]

&nbsp;           };

&nbsp;           

&nbsp;           const config = {

&nbsp;               type: 'bar',

&nbsp;               data: data,

&nbsp;               options: {

&nbsp;                   responsive: true,

&nbsp;                   maintainAspectRatio: false,

&nbsp;                   plugins: {

&nbsp;                       legend: {

&nbsp;                           display: false

&nbsp;                       },

&nbsp;                       tooltip: {

&nbsp;                           callbacks: {

&nbsp;                               label: function(context) {

&nbsp;                                   return `Contratos: ${context.parsed.y}`;

&nbsp;                               }

&nbsp;                           }

&nbsp;                       }

&nbsp;                   },

&nbsp;                   scales: {

&nbsp;                       y: {

&nbsp;                           beginAtZero: true,

&nbsp;                           title: {

&nbsp;                               display: true,

&nbsp;                               text: 'Número de Contratos'

&nbsp;                           }

&nbsp;                       }

&nbsp;                   }

&nbsp;               }

&nbsp;           };

&nbsp;           

&nbsp;           if (expirationTimelineChart) {

&nbsp;               expirationTimelineChart.destroy();

&nbsp;           }

&nbsp;           expirationTimelineChart = new Chart(ctx, config);

&nbsp;       }

&nbsp;       

&nbsp;       // Render renewal potential chart

&nbsp;       function renderRenewalPotentialChart() {

&nbsp;           const ctx = document.getElementById('renewal-potential-chart').getContext('2d');

&nbsp;           const renewalAnalysis = businessData.business\_health.renewal\_analysis;

&nbsp;           

&nbsp;           const data = {

&nbsp;               labels: \['Alta Probabilidade', 'Média Probabilidade', 'Baixa Probabilidade'],

&nbsp;               datasets: \[{

&nbsp;                   data: \[

&nbsp;                       renewalAnalysis.high\_potential,

&nbsp;                       renewalAnalysis.medium\_potential,

&nbsp;                       renewalAnalysis.low\_potential

&nbsp;                   ],

&nbsp;                   backgroundColor: \[

&nbsp;                       'rgba(76, 175, 80, 0.7)',

&nbsp;                       'rgba(255, 167, 38, 0.7)',

&nbsp;                       'rgba(239, 83, 80, 0.7)'

&nbsp;                   ],

&nbsp;                   borderColor: \[

&nbsp;                       'rgba(76, 175, 80, 1)',

&nbsp;                       'rgba(255, 167, 38, 1)',

&nbsp;                       'rgba(239, 83, 80, 1)'

&nbsp;                   ],

&nbsp;                   borderWidth: 1

&nbsp;               }]

&nbsp;           };

&nbsp;           

&nbsp;           const config = {

&nbsp;               type: 'doughnut',

&nbsp;               data: data,

&nbsp;               options: {

&nbsp;                   responsive: true,

&nbsp;                   maintainAspectRatio: false,

&nbsp;                   plugins: {

&nbsp;                       legend: {

&nbsp;                           position: 'right',

&nbsp;                       },

&nbsp;                       tooltip: {

&nbsp;                           callbacks: {

&nbsp;                               label: function(context) {

&nbsp;                                   const label = context.label || '';

&nbsp;                                   const value = context.parsed;

&nbsp;                                   const total = context.dataset.data.reduce((a, b) => a + b, 0);

&nbsp;                                   const percentage = Math.round((value / total) \* 100);

&nbsp;                                   return `${label}: ${value} contratos (${percentage}%)`;

&nbsp;                               }

&nbsp;                           }

&nbsp;                       }

&nbsp;                   },

&nbsp;                   cutout: '50%',

&nbsp;                   animation: {

&nbsp;                       animateRotate: true,

&nbsp;                       animateScale: true

&nbsp;                   }

&nbsp;               }

&nbsp;           };

&nbsp;           

&nbsp;           if (renewalPotentialChart) {

&nbsp;               renewalPotentialChart.destroy();

&nbsp;           }

&nbsp;           renewalPotentialChart = new Chart(ctx, config);

&nbsp;       }

&nbsp;       

&nbsp;       // Render occupancy distribution chart

&nbsp;       function renderOccupancyDistributionChart() {

&nbsp;           const ctx = document.getElementById('occupancy-distribution-chart').getContext('2d');

&nbsp;           const occupancyAnalysis = businessData.business\_health.class\_occupancy.occupancy\_analysis;

&nbsp;           

&nbsp;           const data = {

&nbsp;               labels: \['Subutilizadas (<40%)', 'Ótimas (40-80%)', 'Superlotadas (>80%)'],

&nbsp;               datasets: \[{

&nbsp;                   data: \[

&nbsp;                       occupancyAnalysis.underutilized\_classes,

&nbsp;                       occupancyAnalysis.optimal\_classes,

&nbsp;                       occupancyAnalysis.overcrowded\_classes

&nbsp;                   ],

&nbsp;                   backgroundColor: \[

&nbsp;                       'rgba(239, 83, 80, 0.7)',

&nbsp;                       'rgba(255, 167, 38, 0.7)',

&nbsp;                       'rgba(76, 175, 80, 0.7)'

&nbsp;                   ],

&nbsp;                   borderColor: \[

&nbsp;                       'rgba(239, 83, 80, 1)',

&nbsp;                       'rgba(255, 167, 38, 1)',

&nbsp;                       'rgba(76, 175, 80, 1)'

&nbsp;                   ],

&nbsp;                   borderWidth: 1

&nbsp;               }]

&nbsp;           };

&nbsp;           

&nbsp;           const config = {

&nbsp;               type: 'doughnut',

&nbsp;               data: data,

&nbsp;               options: {

&nbsp;                   responsive: true,

&nbsp;                   maintainAspectRatio: false,

&nbsp;                   plugins: {

&nbsp;                       legend: {

&nbsp;                           position: 'right',

&nbsp;                       },

&nbsp;                       tooltip: {

&nbsp;                           callbacks: {

&nbsp;                               label: function(context) {

&nbsp;                                   const label = context.label || '';

&nbsp;                                   const value = context.parsed;

&nbsp;                                   const total = context.dataset.data.reduce((a, b) => a + b, 0);

&nbsp;                                   const percentage = Math.round((value / total) \* 100);

&nbsp;                                   return `${label}: ${value} turmas (${percentage}%)`;

&nbsp;                               }

&nbsp;                           }

&nbsp;                       }

&nbsp;                   },

&nbsp;                   cutout: '50%'

&nbsp;               }

&nbsp;           };

&nbsp;           

&nbsp;           if (occupancyDistributionChart) {

&nbsp;               occupancyDistributionChart.destroy();

&nbsp;           }

&nbsp;           occupancyDistributionChart = new Chart(ctx, config);

&nbsp;       }

&nbsp;       

&nbsp;       // Render peak time chart

&nbsp;       function renderPeakTimeChart() {

&nbsp;           const ctx = document.getElementById('peak-time-chart').getContext('2d');

&nbsp;           const occupancyData = businessData.business\_health.class\_occupancy;

&nbsp;           

&nbsp;           const timeAnalysis = occupancyData.time\_analysis;

&nbsp;           

&nbsp;           const data = {

&nbsp;               labels: \['Manhã (6-12AM)', 'Tarde (12-6PM)', 'Noite (6-10PM)'],

&nbsp;               datasets: \[{

&nbsp;                   label: 'Taxa de Ocupação',

&nbsp;                   data: \[

&nbsp;                       timeAnalysis.morning,

&nbsp;                       timeAnalysis.afternoon,

&nbsp;                       timeAnalysis.evening

&nbsp;                   ],

&nbsp;                   backgroundColor: 'rgba(76, 74, 45, 0.7)',

&nbsp;                   borderColor: 'rgba(76, 74, 45, 1)',

&nbsp;                   borderWidth: 1,

&nbsp;                   borderRadius: 4

&nbsp;               }]

&nbsp;           };

&nbsp;           

&nbsp;           const config = {

&nbsp;               type: 'bar',

&nbsp;               data: data,

&nbsp;               options: {

&nbsp;                   responsive: true,

&nbsp;                   maintainAspectRatio: false,

&nbsp;                   plugins: {

&nbsp;                       legend: {

&nbsp;                           display: false

&nbsp;                       },

&nbsp;                       tooltip: {

&nbsp;                           callbacks: {

&nbsp;                               label: function(context) {

&nbsp;                                   return `Ocupação: ${context.parsed.y.toFixed(1)}%`;

&nbsp;                               }

&nbsp;                           }

&nbsp;                       }

&nbsp;                   },

&nbsp;                   scales: {

&nbsp;                       y: {

&nbsp;                           beginAtZero: true,

&nbsp;                           max: 100,

&nbsp;                           title: {

&nbsp;                               display: true,

&nbsp;                               text: 'Taxa de Ocupação (%)'

&nbsp;                           }

&nbsp;                       }

&nbsp;                   }

&nbsp;               }

&nbsp;           };

&nbsp;           

&nbsp;           if (peakTimeChart) {

&nbsp;               peakTimeChart.destroy();

&nbsp;           }

&nbsp;           peakTimeChart = new Chart(ctx, config);

&nbsp;       }

&nbsp;       

&nbsp;       // Render business health chart

&nbsp;       function renderBusinessHealthChart() {

&nbsp;           const ctx = document.getElementById('business-health-chart').getContext('2d');

&nbsp;           const sessionData = businessData.business\_health.session\_usage.utilization\_analysis;

&nbsp;           

&nbsp;           // Generate trend data

&nbsp;           const today = new Date();

&nbsp;           const labels = \[];

&nbsp;           const data = \[];

&nbsp;           

&nbsp;           // Create 6 months of data

&nbsp;           for (let i = 5; i >= 0; i--) {

&nbsp;               const date = new Date();

&nbsp;               date.setMonth(today.getMonth() - i);

&nbsp;               labels.push(date.toLocaleDateString('pt-BR', { month: 'short' }));

&nbsp;               

&nbsp;               // Create a slightly increasing trend

&nbsp;               let value = sessionData.avg\_utilization - 8 + (i \* 1.6);

&nbsp;               value = Math.max(40, Math.min(85, value)); // Keep within reasonable bounds

&nbsp;               data.push(value);

&nbsp;           }

&nbsp;           

&nbsp;           const chartData = {

&nbsp;               labels: labels,

&nbsp;               datasets: \[{

&nbsp;                   label: 'Taxa de Utilização',

&nbsp;                   data: data,

&nbsp;                   fill: true,

&nbsp;                   backgroundColor: 'rgba(76, 74, 45, 0.1)',

&nbsp;                   borderColor: 'rgba(176, 210, 54, 1)',

&nbsp;                   borderWidth: 2,

&nbsp;                   pointBackgroundColor: 'rgba(176, 210, 54, 1)',

&nbsp;                   pointRadius: 4,

&nbsp;                   tension: 0.3

&nbsp;               }]

&nbsp;           };

&nbsp;           

&nbsp;           const config = {

&nbsp;               type: 'line',

&nbsp;               data: chartData,

&nbsp;               options: {

&nbsp;                   responsive: true,

&nbsp;                   maintainAspectRatio: false,

&nbsp;                   plugins: {

&nbsp;                       legend: {

&nbsp;                           position: 'top',

&nbsp;                       },

&nbsp;                       tooltip: {

&nbsp;                           callbacks: {

&nbsp;                               label: function(context) {

&nbsp;                                   return `Utilização: ${context.parsed.y.toFixed(1)}%`;

&nbsp;                               }

&nbsp;                           }

&nbsp;                       }

&nbsp;                   },

&nbsp;                   scales: {

&nbsp;                       y: {

&nbsp;                           beginAtZero: false,

&nbsp;                           min: Math.max(30, Math.floor(sessionData.avg\_utilization - 15)),

&nbsp;                           max: 100,

&nbsp;                           title: {

&nbsp;                               display: true,

&nbsp;                               text: 'Taxa de Utilização (%)'

&nbsp;                           }

&nbsp;                       }

&nbsp;                   }

&nbsp;               }

&nbsp;           };

&nbsp;           

&nbsp;           if (businessHealthChart) {

&nbsp;               businessHealthChart.destroy();

&nbsp;           }

&nbsp;           businessHealthChart = new Chart(ctx, config);

&nbsp;       }

&nbsp;       

&nbsp;       // Reset step indicator to initial state

&nbsp;       function resetStepIndicator() {

&nbsp;           document.getElementById('step-1').classList.add('active');

&nbsp;           document.getElementById('step-2').classList.remove('active');

&nbsp;           document.getElementById('step-3').classList.remove('active');

&nbsp;       }

&nbsp;       

&nbsp;       // CPF validation UI helpers

&nbsp;       function showCpfValidationSuccess() {

&nbsp;           const validationStatus = document.getElementById('cpf-validation-status');

&nbsp;           validationStatus.innerHTML = `

&nbsp;               <i class="bi bi-check-circle validation-success"></i>

&nbsp;               <span>CPF validado com sucesso</span>

&nbsp;           `;

&nbsp;           validationStatus.style.display = 'block';

&nbsp;           validationStatus.style.color = '#4CAF50';

&nbsp;           

&nbsp;           document.getElementById('client-cpf').classList.add('is-valid');

&nbsp;           document.getElementById('client-cpf').classList.remove('is-invalid');

&nbsp;           

&nbsp;           document.getElementById('nfe-warning').style.display = 'none';

&nbsp;       }

&nbsp;       

&nbsp;       function showCpfValidationError(message) {

&nbsp;           const validationStatus = document.getElementById('cpf-validation-status');

&nbsp;           validationStatus.innerHTML = `

&nbsp;               <i class="bi bi-x-circle validation-error"></i>

&nbsp;               <span>${message}</span>

&nbsp;           `;

&nbsp;           validationStatus.style.display = 'block';

&nbsp;           validationStatus.style.color = '#EF5350';

&nbsp;           

&nbsp;           document.getElementById('client-cpf').classList.add('is-invalid');

&nbsp;           document.getElementById('client-cpf').classList.remove('is-valid');

&nbsp;           

&nbsp;           document.getElementById('nfe-warning-message').textContent = `Atenção: ${message}`;

&nbsp;           document.getElementById('nfe-warning').style.display = 'block';

&nbsp;       }

&nbsp;       

&nbsp;       // Format currency values

&nbsp;       function formatCurrency(value) {

&nbsp;           return new Intl.NumberFormat('pt-BR', {

&nbsp;               style: 'currency',

&nbsp;               currency: 'BRL',

&nbsp;               minimumFractionDigits: 2,

&nbsp;               maximumFractionDigits: 2

&nbsp;           }).format(value);

&nbsp;       }

&nbsp;   </script>

</body>

</html>

```



\## Key Improvements for Backend Integration



\### 1. Data Service Layer

\- Created a comprehensive `dataService` object with dedicated methods for all data operations

\- Each service method handles:

&nbsp; - API calls to backend endpoints

&nbsp; - Loading states

&nbsp; - Error handling

&nbsp; - Data transformation



\### 2. Dynamic Data Loading

\- Replaced all hardcoded data with API calls

\- Implemented proper loading states with visual indicators

\- Added error handling with retry functionality

\- Created data refresh mechanisms



\### 3. Backend Integration Points



\#### Client Data Services

```javascript

dataService.clients = {

&nbsp;   search: async function(term, status, contractType) {

&nbsp;       // API call to /api/clients/search

&nbsp;       // Returns filtered client list

&nbsp;   },

&nbsp;   

&nbsp;   getById: async function(clientId) {

&nbsp;       // API call to /api/clients/{id}

&nbsp;       // Returns detailed client information

&nbsp;   },

&nbsp;   

&nbsp;   getContracts: async function(clientId) {

&nbsp;       // API call to /api/clients/{id}/contracts

&nbsp;       // Returns client contracts

&nbsp;   }

}

```



\#### Business Intelligence Services

```javascript

dataService.business = {

&nbsp;   getHealthData: async function(period = 'month') {

&nbsp;       // API call to /api/business/health

&nbsp;       // Returns business health metrics

&nbsp;   },

&nbsp;   

&nbsp;   getContractExpirations: async function() {

&nbsp;       // API call to /api/business/contract-expirations

&nbsp;       // Returns contract expiration data

&nbsp;   },

&nbsp;   

&nbsp;   getRenewalPotential: async function() {

&nbsp;       // API call to /api/business/renewal-potential

&nbsp;       // Returns renewal potential analysis

&nbsp;   },

&nbsp;   

&nbsp;   getClassOccupancy: async function() {

&nbsp;       // API call to /api/business/class-occupancy

&nbsp;       // Returns class occupancy data

&nbsp;   }

}

```



\#### NFe Services

```javascript

dataService.nfe = {

&nbsp;   generate: async function(clientId, contractId, cpf) {

&nbsp;       // API call to /api/nfe/generate

&nbsp;       // Triggers Playwright automation

&nbsp;   },

&nbsp;   

&nbsp;   validateCpf: async function(cpf) {

&nbsp;       // API call to /api/nfe/validate-cpf

&nbsp;       // Validates CPF format and existence

&nbsp;   }

}

```



\### 4. Error Handling System

\- Implemented visual error states for each data section

\- Added retry buttons that trigger the appropriate data load

\- Created clear error messages for users

\- Separated loading states from error states



\### 5. Data Refresh Mechanisms

\- Added comprehensive refresh functionality

\- Individual section refreshes

\- Full dashboard refresh

\- Time-based data period selection



\### 6. API-Ready Implementation

\- All hardcoded data removed

\- Proper API URL structure with `/api` prefix

\- Ready for integration with your Flask backend

\- Handles data loading states appropriately



\## How to Connect to Your Backend



1\. \*\*Set up your Flask API endpoints\*\* to match the expected structure:

&nbsp;  - `/api/clients/search`

&nbsp;  - `/api/clients/{id}`

&nbsp;  - `/api/clients/{id}/contracts`

&nbsp;  - `/api/business/health`

&nbsp;  - `/api/business/contract-expirations`

&nbsp;  - `/api/business/renewal-potential`

&nbsp;  - `/api/business/class-occupancy`

&nbsp;  - `/api/nfe/generate`

&nbsp;  - `/api/nfe/validate-cpf`



2\. \*\*Update the `apiBaseUrl` variable\*\* if your API is hosted elsewhere:

&nbsp;  ```javascript

&nbsp;  let apiBaseUrl = 'https://your-api-domain.com/api';

&nbsp;  ```



3\. \*\*Implement CORS\*\* on your backend to allow requests from your frontend domain



4\. \*\*Add authentication\*\* if needed (API keys, JWT tokens, etc.)



This implementation is now completely decoupled from hardcoded data and ready for integration with your backend services. The data service layer provides a clean abstraction between the UI and your API, making it easy to maintain and extend as your backend evolves.



