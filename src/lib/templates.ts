export type BriefingBlock = {
    id: string;
    type: 'text' | 'textarea' | 'select' | 'upload';
    label: string;
    placeholder?: string;
    options?: string[];
        answer?: string;
};

export const BRIEFING_TEMPLATES = {
    custom: {
        name: "Começar do Zero",
        description: "Crie suas próprias perguntas.",
        blocks: [
            { id: '1', type: 'text', label: "Nome do Projeto", placeholder: "Ex: Campanha de Natal" }
        ] as BriefingBlock[]
    },
    branding: {
        name: "Identidade Visual (Logo)",
        description: "Essencial para criar marcas fortes.",
        blocks: [
            { id: '1', type: 'text', label: "Nome da Marca", placeholder: "Como a empresa se chama exatamente?" },
            { id: '2', type: 'textarea', label: "O que a empresa faz?", placeholder: "Descreva os produtos/serviços e o diferencial." },
            { id: '3', type: 'select', label: "Arquétipo / Personalidade", options: ["Séria e Corporativa", "Jovem e Divertida", "Luxuosa e Exclusiva", "Minimalista e Tech", "Rústica e Natural"] },
            { id: '4', type: 'textarea', label: "Público Alvo", placeholder: "Quem compra? Idade, interesses, classe social..." },
            { id: '5', type: 'textarea', label: "Concorrentes", placeholder: "Cite 3 concorrentes diretos (links ou nomes)." },
            { id: '6', type: 'text', label: "Cores de Preferência", placeholder: "Ex: Azul marinho, Dourado... ou 'Evitar Vermelho'" },
            { id: '7', type: 'select', label: "Tipo de Logo Preferido", options: ["Apenas Tipografia (Wordmark)", "Símbolo Abstrato", "Mascote/Ilustrativo", "Emblema/Brasão", "Deixo a critério do designer"] }
        ] as BriefingBlock[]
    },
    landing_page: {
        name: "Landing Page / Site",
        description: "Estruture o conteúdo para conversão.",
        blocks: [
            { id: '1', type: 'text', label: "Objetivo Principal", placeholder: "Vender produto, Capturar Leads (Email), Agendar Reunião?" },
            { id: '2', type: 'textarea', label: "Promessa Única (Headline)", placeholder: "Qual a frase principal do topo do site? Ex: 'Emagreça em 30 dias'" },
            { id: '3', type: 'textarea', label: "Benefícios do Produto", placeholder: "Liste 3 a 5 benefícios principais." },
            { id: '4', type: 'text', label: "Link para Compra/Ação", placeholder: "Para onde o botão deve levar? (Whatsapp, Checkout...)" },
            { id: '5', type: 'textarea', label: "Referências de Design", placeholder: "Cole links de sites que você acha bonitos." },
            { id: '6', type: 'select', label: "Estilo do Layout", options: ["Clean e Branco", "Dark Mode", "Colorido e Vibrante"] },
            { id: '7', type: 'textarea', label: "Depoimentos (Prova Social)", placeholder: "Cole aqui textos de clientes satisfeitos (se tiver)." }
        ] as BriefingBlock[]
    },
    social_media: {
        name: "Social Media Pack",
        description: "Posts para Instagram/Linkedin.",
        blocks: [
            { id: '1', type: 'select', label: "Rede Social Principal", options: ["Instagram", "LinkedIn", "Facebook", "TikTok/Reels"] },
            { id: '2', type: 'textarea', label: "Temas dos Posts", placeholder: "Ex: 1. Dica técnica, 2. Meme, 3. Promoção" },
            { id: '3', type: 'text', label: "Link da Pasta de Fotos", placeholder: "Drive/Dropbox com fotos do produto (se tiver)" },
            { id: '4', type: 'textarea', label: "Legendas / Textos", placeholder: "O texto deve ir na imagem ou na legenda?" },
            { id: '5', type: 'select', label: "Frequência", options: ["Post Único", "Pacote Mensal (12 posts)", "Stories"] }
        ] as BriefingBlock[]
    },
    video_edit: {
        name: "Edição de Vídeo",
        description: "Roteiro e estilo para vídeos.",
        blocks: [
            { id: '1', type: 'text', label: "Duração Aproximada", placeholder: "Ex: 15s (Stories), 1min (Reels), 10min (YouTube)" },
            { id: '2', type: 'select', label: "Formato", options: ["Vertical (9:16)", "Horizontal (16:9)", "Quadrado (1:1)"] },
            { id: '3', type: 'text', label: "Link do Material Bruto", placeholder: "Onde estão os arquivos de vídeo?" },
            { id: '4', type: 'textarea', label: "Referência de Estilo", placeholder: "Link de um vídeo com edição parecida (Ex: Cortes rápidos, estilo Alex Hormozi)" },
            { id: '5', type: 'text', label: "Música / Trilha", placeholder: "Alguma preferência de gênero musical?" }
        ] as BriefingBlock[]
    }
};
