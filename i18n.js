module.exports = {
    'en': { // English
        page: 'Page',
        recommendations: 'recommendations',
        regexps: {
            languageProficiency: /proficiency\)$/,
            jobTitle: /\s{2,}at\s{2,}/
        },
        sectionHeaders: {
            'Summary': { text: 'Summary', section: 'bio' },
            'Languages': { text: 'Languages', section: 'languages' },
            'Education': { text: 'Education', section: 'educationExperience' },
            'Experience': { text: 'Experience', section: 'workExperience' },
            'Skills & Expertise': { text: 'Skills & Expertise', section: 'skills' },
            'Volunteer Experience': { text: 'Volunteer Experience', section: 'volunteerExperience' },
            'Unsupported': { text: 'Unsupported', section: 'unsupported' }
        },
        unSupportedSections: ['Publications', 'Projects', 'Certifications', 'Organizations', 'Test Scores', 'Specialties', 'Honors and Awards', 'Interests', 'Courses', 'recommendations', 'Patents']
    },
    'pt': { // Portuguese
        page: 'Página',
        recommendations: 'recomendou',
        regexps: {
            languageProficiency: /(^\(Nível)|(proficiency\)$|(^\(Fluente))/,
            jobTitle: /\s{2,}na\s{2,}/
        },
        replace: {
            dates: {
                'Presente': 'Present',
                'janeiro de': 'January',
                'fevereiro de': 'February',
                'março de': 'March',
                'abril de': 'April',
                'maio de': 'May',
                'junho de': 'June',
                'julho de': 'July',
                'agosto de': 'August',
                'septembro de': 'September',
                'outubro de': 'October',
                'novembro de': 'November',
                'dezembro de': 'December'
            },
            duration: {
                'menos de un ano': 'less than a year',
                'ano': 'year',
                'mês': 'month',
                'anos': 'years',
                'meses': 'months'
            }
        },
        sectionHeaders: {
            'Summary': { text: 'Resumo', section: 'bio' },
            'Languages': { text: 'Idiomas', section: 'languages' },
            'Education': { text: 'Formação acadêmica', section: 'educationExperience' },
            'Experience': { text: 'Experiência', section: 'workExperience' },
            'Skills & Expertise': { text: 'Competências e especialidades', section: 'skills' },
            'Volunteer Experience': { text: 'Experiência voluntária', section: 'volunteerExperience' },
            'Unsupported': { text: 'Sem suporte', section: 'unsupported' }
        },
        unSupportedSections: ['Publicações', 'Projetos', 'Certificações', 'Organizações', 'Resultados dos testes', 'Especialidades', 'Honras e Prêmios', 'Interesses', 'Cursos', 'recomendou', 'Patentes']
    },
    'es': { // Spanish
        page: 'Página',
        recommendations: 'recomendado',
        regexps: {
            languageProficiency: /(^\(Competencia)|(proficiency\)$)/,
            jobTitle: /\s{2,}en\s{2,}/
        },
        replace: {
            dates: {
                'Actualidad': 'Present',
                'enero de': 'January',
                'febrero de': 'February',
                'marzo de': 'March',
                'abril de': 'April',
                'mayo de': 'May',
                'junio de': 'June',
                'julio de': 'July',
                'agosto de': 'August',
                'septiember de': 'September',
                'octubre de': 'October',
                'noviembre de': 'November',
                'diciembre de': 'December'
            },
            duration: {
                'menos de un año': 'less than a year',
                'años': 'years',
                'meses': 'months',
                'año': 'year',
                'mes': 'month'
            }
        },
        sectionHeaders: {
            'Summary': { text: 'Extracto', section: 'bio' },
            'Languages': { text: 'Idiomas', section: 'languages' },
            'Education': { text: 'Educación', section: 'educationExperience' },
            'Experience': { text: 'Experiencia', section: 'workExperience' },
            'Skills & Expertise': { text: 'Aptitudes y conocimientos', section: 'skills' },
            'Volunteer Experience': { text: 'Experiencia como voluntario', section: 'volunteerExperience' },
            'Unsupported': { text: 'No admitido', section: 'unsupported' }
        },
        unSupportedSections: ['Publicaciones', 'Proyectos', 'Certificaciones', 'Organizaciones', 'Resultados de Prueba', 'Especialidades', 'Honores y Premios', 'Intereses', 'Cursos', 'recomendado', 'Patentes']
    },
    'fr': { // French
        page: 'Page',
        recommendations: 'recommandé',
        regexps: {
            languageProficiency: /(^\(Compétence)|(^\(Notions)|(^\(Bilingue)|(proficiency\)$)/,
            jobTitle: /\s{2,},\s{2,}/
        },
        replace: {
            dates: {
                'Aujourd’hui': 'Present',
                'janvier': 'January',
                'février': 'February',
                'mars': 'March',
                'avril': 'April',
                'mai': 'May',
                'juin': 'June',
                'juillet': 'July',
                'août': 'August',
                'septembre': 'September',
                'octobre': 'October',
                'novembre': 'November',
                'décembre': 'December'
            },
            duration: {
                'moins d\'un an': 'less than a year',
                'années': 'years',
                'mois': 'months',
                'année': 'year'
            }
        },
        sectionHeaders: {
            'Summary': { text: 'Résumé', section: 'bio' },
            'Languages': { text: 'Langues', section: 'languages' },
            'Education': { text: 'Formation', section: 'educationExperience' },
            'Experience': { text: 'Expérience', section: 'workExperience' },
            'Skills & Expertise': { text: 'Compétences et expertise', section: 'skills' },
            'Volunteer Experience': { text: 'Expériences de bénévolat', section: 'volunteerExperience' },
            'Unsupported': { text: 'Non pris en charge', section: 'unsupported' }
        },
        unSupportedSections: ['Publications', 'Projets', 'Certifications', 'Organisations', 'Résultats d’examens', 'Especialidades', 'Prix et distinctions', 'Intérêts', 'Cours', 'recommandé', 'Brevets']
    },
    'it': { // Italian
        page: 'Pagina',
        recommendations: 'raccomandato',
        regexps: {
            languageProficiency: /^\(Conoscenza/,
            jobTitle: /\s{2,}presso\s{2,}/
        },
        replace: {
            dates: {
                'Presente': 'Present',
                'Gennaio': 'January',
                'Febbraio': 'February',
                'Marzo': 'March',
                'Aprile': 'April',
                'Mag': 'May',
                'Giugno': 'June',
                'Luglio': 'July',
                'Agosto': 'August',
                'Settembre': 'September',
                'Ottobre': 'October',
                'Novembre': 'November',
                'Diecembre': 'December'
            },
            duration: {
                'meno di un anno': 'less than a year',
                'anni': 'years',
                'mesi': 'months',
                'anno': 'year',
                'mese': 'month'
            }
        },
        sectionHeaders: {
            'Summary': { text: 'Riepilogo', section: 'bio' },
            'Languages': { text: 'Lingue', section: 'languages' },
            'Education': { text: 'Formazione', section: 'educationExperience' },
            'Experience': { text: 'Esperienza', section: 'workExperience' },
            'Skills & Expertise': { text: 'Competenze ed esperienze', section: 'skills' },
            'Volunteer Experience': { text: 'Esperienze di volontariato', section: 'volunteerExperience' },
            'Unsupported': { text: 'Non supportato', section: 'unsupported' }
        },
        unSupportedSections: ['Pubblicazioni', 'Progetti', 'Certificazioni', 'Organizzazioni', 'Votazione esame', 'Specialità', 'Riconoscimenti e premi', 'Intérêts', 'Corsi', 'raccomandato', 'Brevetti']
    }
};
