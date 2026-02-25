const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// 🔒 VALIDAÇÃO OBRIGATÓRIA DE CREDENCIAIS
// ========================================

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    console.error('\n❌ ========================================');
    console.error('❌ ERRO CRÍTICO: Credenciais do admin não configuradas!');
    console.error('❌ ========================================');
    console.error('\n📝 Configure as variáveis de ambiente:');
    console.error('   ADMIN_USERNAME=Miqueias');
    console.error('   ADMIN_PASSWORD=@Mikeias09');
    console.error('\n💡 Exemplo de uso:');
    console.error('   ADMIN_USERNAME=Miqueias ADMIN_PASSWORD=@Mikeias09 npm start');
    console.error('\n💡 Ou crie um arquivo .env:');
    console.error('   cp .env.example .env');
    console.error('   # Edite o .env e configure as credenciais\n');
    process.exit(1); // ENCERRA O PROCESSO
}

// Validação adicional: credenciais não podem estar vazias
const ADMIN_USERNAME = process.env.ADMIN_USERNAME.trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD.trim();

if (ADMIN_USERNAME.length === 0 || ADMIN_PASSWORD.length === 0) {
    console.error('\n❌ ========================================');
    console.error('❌ ERRO: Credenciais não podem estar vazias!');
    console.error('❌ ========================================\n');
    process.exit(1);
}

// Validação de segurança: senha mínima
if (ADMIN_PASSWORD.length < 8) {
    console.error('\n❌ ========================================');
    console.error('❌ ERRO: Senha muito fraca!');
    console.error('❌ A senha deve ter pelo menos 8 caracteres');
    console.error('❌ ========================================\n');
    process.exit(1);
}

console.log('\n🔐 ========================================');
console.log('✅ Credenciais do Admin configuradas:');
console.log(`   Usuário: ${ADMIN_USERNAME}`);
console.log(`   Senha: ${'*'.repeat(ADMIN_PASSWORD.length)} (${ADMIN_PASSWORD.length} caracteres)`);
console.log('🔐 ========================================\n');

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(express.static('public'));

// Configuração de sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'plataformas-dy-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true em produção com HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// ========================================
// BANCO DE DADOS SQLITE
// ========================================

const db = new sqlite3.Database('clicks.db', (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado ao banco SQLite (clicks.db)');
});

// Criar tabela se não existir
db.run(`CREATE TABLE IF NOT EXISTS clicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_id TEXT NOT NULL,
    platform_name TEXT NOT NULL,
    platform_url TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT
)`, (err) => {
    if (err) {
        console.error('❌ Erro ao criar tabela:', err.message);
    } else {
        console.log('✅ Tabela "clicks" pronta\n');
    }
});

// ========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ========================================

function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    }
    res.status(401).json({
        success: false,
        message: 'Não autorizado. Faça login primeiro.'
    });
}

// ========================================
// ROTAS DE AUTENTICAÇÃO
// ========================================

// Login
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    // Validação de entrada
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Usuário e senha são obrigatórios'
        });
    }

    // Validação de credenciais
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.authenticated = true;
        req.session.username = username;

        console.log(`✅ Login bem-sucedido: ${username} (${new Date().toLocaleString('pt-BR')})`);

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            username: username
        });
    } else {
        console.log(`❌ Tentativa de login falhou: usuário="${username}" (${new Date().toLocaleString('pt-BR')})`);

        res.status(401).json({
            success: false,
            message: 'Usuário ou senha incorretos'
        });
    }
});

// Verificar autenticação
app.get('/api/admin/check', (req, res) => {
    if (req.session && req.session.authenticated) {
        res.json({
            success: true,
            authenticated: true,
            username: req.session.username
        });
    } else {
        res.json({
            success: true,
            authenticated: false
        });
    }
});

// Logout
app.post('/api/admin/logout', (req, res) => {
    const username = req.session.username;
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Erro ao fazer logout:', err);
            return res.status(500).json({
                success: false,
                message: 'Erro ao fazer logout'
            });
        }
        console.log(`🚪 Logout: ${username} (${new Date().toLocaleString('pt-BR')})`);
        res.json({
            success: true,
            message: 'Logout realizado com sucesso'
        });
    });
});

// ========================================
// ROTAS PÚBLICAS
// ========================================

// Registrar clique
app.post('/api/click', (req, res) => {
    const { platform_id, platform_name, platform_url } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    if (!platform_id || !platform_name || !platform_url) {
        return res.status(400).json({
            success: false,
            message: 'Dados incompletos'
        });
    }

    const sql = `INSERT INTO clicks (platform_id, platform_name, platform_url, ip_address, user_agent)
                 VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [platform_id, platform_name, platform_url, ip, userAgent], function(err) {
        if (err) {
            console.error('❌ Erro ao registrar clique:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Erro ao registrar clique'
            });
        }

        console.log(`📊 Clique registrado: ${platform_name} (ID: ${this.lastID})`);

        res.json({
            success: true,
            message: 'Clique registrado com sucesso',
            id: this.lastID
        });
    });
});

// ========================================
// ROTAS PROTEGIDAS (ADMIN)
// ========================================

// Estatísticas gerais
app.get('/api/stats', requireAuth, (req, res) => {
    const sql = `SELECT 
                    platform_id,
                    platform_name,
                    COUNT(*) as clicks
                 FROM clicks
                 GROUP BY platform_id, platform_name
                 ORDER BY clicks DESC`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('❌ Erro ao buscar estatísticas:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar estatísticas'
            });
        }

        const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
        const totalValue = totalClicks * 1.00;

        res.json({
            success: true,
            stats: {
                total_clicks: totalClicks,
                total_value: totalValue,
                platforms: rows.map(row => ({
                    platform_id: row.platform_id,
                    platform_name: row.platform_name,
                    clicks: row.clicks,
                    value: row.clicks * 1.00
                }))
            }
        });
    });
});

// Histórico de cliques (com filtros e paginação)
app.get('/api/admin/history', requireAuth, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const platform = req.query.platform || '';
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';

    let whereClauses = [];
    let params = [];

    if (platform) {
        whereClauses.push('platform_id = ?');
        params.push(platform);
    }

    if (startDate) {
        whereClauses.push('DATE(timestamp) >= DATE(?)');
        params.push(startDate);
    }

    if (endDate) {
        whereClauses.push('DATE(timestamp) <= DATE(?)');
        params.push(endDate);
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Buscar total de registros
    const countSql = `SELECT COUNT(*) as total FROM clicks ${whereClause}`;

    db.get(countSql, params, (err, countRow) => {
        if (err) {
            console.error('❌ Erro ao contar registros:', err.message);
            return res.status(500).json({ success: false, message: 'Erro ao buscar histórico' });
        }

        const total = countRow.total;

        // Buscar registros da página
        const sql = `SELECT * FROM clicks ${whereClause} ORDER BY timestamp DESC LIMIT ? OFFSET ?`;
        const queryParams = [...params, limit, offset];

        db.all(sql, queryParams, (err, rows) => {
            if (err) {
                console.error('❌ Erro ao buscar histórico:', err.message);
                return res.status(500).json({ success: false, message: 'Erro ao buscar histórico' });
            }

            res.json({
                success: true,
                history: {
                    records: rows,
                    pagination: {
                        current_page: page,
                        total_pages: Math.ceil(total / limit),
                        total_records: total,
                        per_page: limit,
                        has_next: offset + limit < total,
                        has_prev: page > 1
                    }
                }
            });
        });
    });
});

// Exportar CSV completo
app.get('/api/admin/export-csv', requireAuth, (req, res) => {
    const platform = req.query.platform || '';
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';

    let whereClauses = [];
    let params = [];

    if (platform) {
        whereClauses.push('platform_id = ?');
        params.push(platform);
    }

    if (startDate) {
        whereClauses.push('DATE(timestamp) >= DATE(?)');
        params.push(startDate);
    }

    if (endDate) {
        whereClauses.push('DATE(timestamp) <= DATE(?)');
        params.push(endDate);
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    const sql = `SELECT * FROM clicks ${whereClause} ORDER BY timestamp DESC`;

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('❌ Erro ao exportar CSV:', err.message);
            return res.status(500).json({ success: false, message: 'Erro ao exportar CSV' });
        }

        console.log(`📥 CSV exportado: ${rows.length} registros (usuário: ${req.session.username})`);

        // Gerar CSV
        let csv = 'ID,Plataforma,Nome,URL,Data/Hora,IP,User-Agent\n';
        rows.forEach(row => {
            const timestamp = new Date(row.timestamp).toLocaleString('pt-BR');
            csv += `${row.id},"${row.platform_id}","${row.platform_name}","${row.platform_url}","${timestamp}","${row.ip_address}","${row.user_agent}"\n`;
        });

        const filename = `historico_completo_${new Date().toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send('\uFEFF' + csv); // BOM para UTF-8
    });
});

// Resetar todos os cliques
app.delete('/api/admin/clicks', requireAuth, (req, res) => {
    const sql = 'DELETE FROM clicks';

    db.run(sql, [], function(err) {
        if (err) {
            console.error('❌ Erro ao resetar cliques:', err.message);
            return res.status(500).json({
                success: false,
                message: 'Erro ao resetar cliques'
            });
        }

        console.log(`⚠️ ADMIN RESETOU TODOS OS CLIQUES (${this.changes} registros deletados) - Usuário: ${req.session.username}`);

        res.json({
            success: true,
            message: 'Todos os cliques foram resetados com sucesso',
            deleted_count: this.changes
        });
    });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
    console.log('🚀 ========================================');
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`📊 Front-end: http://localhost:${PORT}`);
    console.log(`🔐 Painel Admin: http://localhost:${PORT}/admin.html`);
    console.log(`🔑 Credenciais: ${ADMIN_USERNAME} / ${'*'.repeat(ADMIN_PASSWORD.length)}`);
    console.log('🚀 ========================================\n');
});

// Tratamento de erro
process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    db.close((err) => {
        if (err) {
            console.error('❌ Erro ao fechar banco:', err.message);
        }
        console.log('✅ Banco de dados fechado');
        process.exit(0);
    });
});
