/* ========================================================================== */
/* 1. CONFIGURAÇÕES */
/* ========================================================================== */

const CONFIG = {
    usuario: "contatogrupoconnecta@gmail.com",
    senha: "grupoconnecta123"
};

let graficoInstance = null;


/* ========================================================================== */
/* 2. INICIALIZAÇÃO DO SISTEMA */
/* ========================================================================== */

window.onload = () => {
    configurarMascaras();
    atualizarDashboard();
    mostrarHistorico();
    criarGrafico();
};

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.getElementById("login").style.display !== "none") {
        login();
    }
});


/* ========================================================================== */
/* 3. SISTEMA DE LOGIN */
/* ========================================================================== */

function login() {

    const user = document.getElementById("user").value;
    const pass = document.getElementById("pass").value;
    const erro = document.getElementById("erroLogin");

    if (user === CONFIG.usuario && pass === CONFIG.senha) {

        document.getElementById("login").style.display = "none";
        document.getElementById("dashboard").style.display = "block";

        atualizarDashboard();
        criarGrafico();

    } else {

        erro.innerText = "Login ou senha incorretos.";
        erro.classList.add("mostrar");

    }
}


/* ========================================================================== */
/* 4. FORMATAÇÃO E MÁSCARAS */
/* ========================================================================== */

function configurarMascaras() {

    const inputsMoeda = [
        "receita",
        "gastosCalc",
        "campoGasto",
        "campoEstoque"
    ];

    inputsMoeda.forEach(id => {

        const el = document.getElementById(id);

        if (!el) return;

        el.addEventListener("input", (e) => {

            let valor = e.target.value.replace(/\D/g, "");

            valor = (valor / 100)
                .toFixed(2)
                .replace(".", ",");

            valor = valor.replace(
                /(\d)(?=(\d{3})+(?!\d))/g,
                "$1."
            );

            e.target.value = valor;

        });

    });

}


function converterParaNumero(valorTexto) {

    if (!valorTexto) return 0;

    return parseFloat(
        valorTexto
            .replace(/\./g, "")
            .replace(",",".")
    ) || 0;

}


function formatarMoeda(valor) {

    return Number(valor).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    );

}


/* ========================================================================== */
/* 5. CÁLCULOS E REGISTROS */
/* ========================================================================== */

function calcular() {

    const receita = converterParaNumero(
        document.getElementById("receita").value
    );

    const gastos = converterParaNumero(
        document.getElementById("gastosCalc").value
    );

    const lucro = receita - gastos;

    salvarDados({
        receita,
        gastos,
        lucro
    });

    document.getElementById("resultado").innerText =
        `Lucro: ${formatarMoeda(lucro)}`;

    salvarRegistro(
        `📊 Cálculo: Receita ${formatarMoeda(receita)} | Gastos ${formatarMoeda(gastos)} | Lucro ${formatarMoeda(lucro)}`
    );

    atualizarDashboard();
    criarGrafico();

}


function registrarGasto() {

    const valor = converterParaNumero(
        document.getElementById("campoGasto").value
    );

    localStorage.setItem("gastos", valor);

    salvarRegistro(
        `💸 Gasto registrado: ${formatarMoeda(valor)}`
    );

    atualizarDashboard();
    criarGrafico();

}


function registrarEstoque() {

    const valor = converterParaNumero(
        document.getElementById("campoEstoque").value
    );

    localStorage.setItem("estoque", valor);

    salvarRegistro(
        `📦 Estoque atualizado: ${valor.toFixed(2).replace(".", ",")} unidades`
    );

    atualizarDashboard();
    criarGrafico();

}


/* ========================================================================== */
/* 6. DASHBOARD */
/* ========================================================================== */

function atualizarDashboard() {

    const dados = {

        estoque: localStorage.getItem("estoque") || 0,
        gastos: localStorage.getItem("gastos") || 0,
        lucro: localStorage.getItem("lucro") || 0,
        receita: localStorage.getItem("receita") || 0

    };

    if (document.getElementById("estoqueCard"))
        document.getElementById("estoqueCard").innerText =
            dados.estoque.replace(".", ",");

    if (document.getElementById("gastosCard"))
        document.getElementById("gastosCard").innerText =
            formatarMoeda(dados.gastos);

    if (document.getElementById("lucroCard"))
        document.getElementById("lucroCard").innerText =
            formatarMoeda(dados.lucro);

    if (document.getElementById("receitaCard"))
        document.getElementById("receitaCard").innerText =
            formatarMoeda(dados.receita);

}


function salvarDados(dados) {

    Object.keys(dados).forEach(chave => {
        localStorage.setItem(chave, dados[chave]);
    });

}


/* ========================================================================== */
/* 7. HISTÓRICO */
/* ========================================================================== */

function salvarRegistro(texto) {

    let historico =
        JSON.parse(localStorage.getItem("historico")) || [];

    const agora =
        new Date().toLocaleString('pt-BR');

    historico.push(`${texto} | ${agora}`);

    localStorage.setItem(
        "historico",
        JSON.stringify(historico)
    );

    mostrarHistorico();

}


function mostrarHistorico() {

    const lista =
        document.getElementById("listaHistorico");

    if (!lista) return;

    lista.innerHTML = "";

    const historico =
        JSON.parse(localStorage.getItem("historico")) || [];

    historico
        .slice()
        .reverse()
        .forEach(item => {

            const li =
                document.createElement("li");

            li.innerText = item;

if(item.includes("Gasto")){
li.style.borderLeft="4px solid #ef4444";
}

if(item.includes("Estoque")){
li.style.borderLeft="4px solid #f59e0b";
}

if(item.includes("Cálculo")){
li.style.borderLeft="4px solid #3b82f6";
}

            lista.appendChild(li);

        });

}


/* ========================================================================== */
/* 8. GRÁFICO */
/* ========================================================================== */

function criarGrafico(){

const canvas = document.getElementById("graficoFinanceiro");
if(!canvas) return;

const ctx = canvas.getContext("2d");

if(graficoInstance) graficoInstance.destroy();

graficoInstance = new Chart(ctx,{

type:"doughnut",

data:{
labels:["Receita","Gastos","Lucro"],

datasets:[{

data:[
localStorage.getItem("receita") || 0,
localStorage.getItem("gastos") || 0,
localStorage.getItem("lucro") || 0
],

backgroundColor:[
"#22c55e",
"#ef4444",
"#3b82f6"
],

borderWidth:0

}]

},

options:{
responsive:true,
maintainAspectRatio:false,
plugins:{
legend:{
labels:{
color:"white"
}
}
}
}

});

}


/* ========================================================================== */
/* 9. NAVEGAÇÃO ENTRE PÁGINAS */
/* ========================================================================== */

function mostrar(idPagina) {

    const paginas =
        document.querySelectorAll(".pagina");

    paginas.forEach(p =>
        p.classList.remove("ativa")
    );

    document
        .getElementById(idPagina)
        .classList.add("ativa");

}


/* ========================================================================== */
/* 10. UTILIDADES */
/* ========================================================================== */

function limparDados() {

    if (confirm("Deseja apagar tudo?")) {

        localStorage.clear();
        location.reload();

    }

}

/* ========================================================================== */
/* 11. MODAL LIMPAR HISTÓRICO */
/* ========================================================================== */

function abrirModal(){
    const modal = document.getElementById("modalLimpar");
    if(modal){
        modal.style.display = "flex";
    }
}

function fecharModal(){
    const modal = document.getElementById("modalLimpar");
    if(modal){
        modal.style.display = "none";
    }
}

function confirmarLimpeza(){

    // limpa os dados
    localStorage.removeItem("historico");
    localStorage.removeItem("estoque");
    localStorage.removeItem("gastos");
    localStorage.removeItem("lucro");
    localStorage.removeItem("receita");

    // limpa o histórico visual
    const lista = document.getElementById("listaHistorico");
    if(lista){
        lista.innerHTML = "";
    }

    // atualiza dashboard
    atualizarDashboard();
    criarGrafico();

    // FECHA O MODAL
    fecharModal();

}

function mostrar(idPagina){

const paginas=document.querySelectorAll(".pagina");

paginas.forEach(p=>{
p.classList.remove("ativa");
});

const pagina=document.getElementById(idPagina);

pagina.classList.add("ativa");

pagina.style.opacity="0";
pagina.style.transform="translateY(10px)";

setTimeout(()=>{

pagina.style.opacity="1";
pagina.style.transform="translateY(0)";

},100);

}
