// Tipos para o sistema hoteleiro

/**
 * @typedef {Object} Quarto
 * @property {string} id - ID único do quarto
 * @property {string} numero - Número do quarto
 * @property {'standard'|'deluxe'|'triplo'} tipo - Tipo do quarto
 * @property {string[]} caracteristicas - Lista de características (ex: ['Ar condicionado'])
 * @property {'disponivel'|'ocupado'|'manutencao'|'reserva_dupla'} status - Status atual
 * @property {number} preco - Preço por diária
 */

/**
 * @typedef {Object} Hospede
 * @property {string} id - ID único do hóspede
 * @property {string} nome - Nome completo
 * @property {string} email - Email de contato
 * @property {string} telefone - Telefone de contato
 * @property {string} documento - CPF ou documento de identidade
 */

/**
 * @typedef {Object} Reserva
 * @property {string} id - ID único da reserva
 * @property {string} quartoId - ID do quarto reservado
 * @property {Hospede} hospede - Dados do hóspede
 * @property {Date} dataCheckIn - Data de check-in
 * @property {Date} dataCheckOut - Data de check-out
 * @property {'confirmada'|'cancelada'|'finalizada'|'em_andamento'} status - Status da reserva
 * @property {number} valor - Valor total da reserva
 * @property {Date} dataCriacao - Data de criação da reserva
 */

/**
 * @typedef {Object} Despesa
 * @property {string} id - ID único da despesa
 * @property {string} categoria - Categoria da despesa
 * @property {string} descricao - Descrição detalhada
 * @property {number} valor - Valor da despesa
 * @property {Date} data - Data da despesa
 * @property {'fixa'|'variavel'} tipo - Tipo da despesa
 * @property {string} responsavel - Responsável pela despesa
 */

/**
 * @typedef {Object} FluxoCaixa
 * @property {string} id - ID único do registro
 * @property {'entrada'|'saida'} tipo - Tipo de movimentação
 * @property {number} valor - Valor da movimentação
 * @property {string} descricao - Descrição da movimentação
 * @property {Date} data - Data da movimentação
 * @property {string} categoria - Categoria da movimentação
 * @property {string} origem - Origem da movimentação (reserva, despesa, etc.)
 */

export {};
