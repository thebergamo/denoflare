/// <reference lib="dom" />

import { css, html } from '../deps_app.ts';
import { Material } from '../material.ts';
import { StaticData } from '../static_data.ts';
import { TailwebAppVM } from '../tailweb_app_vm.ts';

export const HEADER_HTML = html`
<header class="h6 high-emphasis-text">
    <div id="header-content">
        Denoflare Tail
        <span id="header-version" class="overline medium-emphasis-text"></span>
        <a href="https://github.com/skymethod/denoflare" target="_blank" id="github-logo-anchor"><img id="github-logo"></a>
    </div>
</header>
`;

export const HEADER_CSS = css`
header {
    display: flex;
    padding: 1rem 0;
    user-select: none; -webkit-user-select: none;
}

#header-content {
    flex-grow: 1;
    display: flex;
    align-items: baseline;
    padding-right: 2.2rem;
}

#header-version {
    flex-grow: 1;
    text-align: center;
}

#github-logo-anchor {
    line-height: 0;
    opacity: 0.5;
}

@media (hover: hover) {
    #github-logo-anchor:hover {
        opacity: 0.75;
    }
}

#github-logo {
    width: 1rem;
    margin-bottom: -0.1rem;
}

`;

export function initHeader(document: HTMLDocument, vm: TailwebAppVM, data: StaticData): () => void {
    const headerContentElement = document.getElementById('header-content') as HTMLElement;
    if ((data.flags || '').includes('demo-toggle')) {
        headerContentElement.addEventListener('dblclick', e => {
            e.preventDefault();
            vm.toggleDemoMode();
        });
    }
    
    const headerVersionSpan = document.getElementById('header-version') as HTMLSpanElement;
    const { version } = data;
    headerVersionSpan.textContent = version ? `v${version}` : '';

    const githubLogoImg = document.getElementById('github-logo') as HTMLImageElement;
    githubLogoImg.src = computeGithubLogoDataUrl();

    return () => {
    };
}

//

function computeGithubLogoDataUrl() {
    const svg = GITHUB_LOGO.replace('fill:white;', `fill:${Material.highEmphasisTextColor};`);
    return 'data:image/svg+xml;utf8,' + svg;
}

//

const GITHUB_LOGO = `<svg width="auto" height="auto" viewBox="0 0 136 133" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
<g transform="matrix(4.16667,0,0,4.16667,-568,-1381.06)">
    <path d="M152.608,331.455C143.614,331.455 136.32,338.748 136.32,347.745C136.32,354.942 140.987,361.047 147.46,363.201C148.275,363.351 148.572,362.848 148.572,362.416C148.572,362.029 148.558,361.005 148.55,359.646C144.019,360.63 143.063,357.462 143.063,357.462C142.322,355.58 141.254,355.079 141.254,355.079C139.775,354.069 141.366,354.089 141.366,354.089C143.001,354.204 143.861,355.768 143.861,355.768C145.314,358.257 147.674,357.538 148.602,357.121C148.75,356.069 149.171,355.351 149.636,354.944C146.019,354.533 142.216,353.135 142.216,346.893C142.216,345.115 142.851,343.66 143.893,342.522C143.725,342.11 143.166,340.453 144.053,338.211C144.053,338.211 145.42,337.773 148.532,339.881C149.831,339.519 151.225,339.339 152.61,339.332C153.994,339.339 155.387,339.519 156.688,339.881C159.798,337.773 161.163,338.211 161.163,338.211C162.052,340.453 161.493,342.11 161.326,342.522C162.37,343.66 163,345.115 163,346.893C163,353.151 159.191,354.528 155.563,354.931C156.147,355.434 156.668,356.428 156.668,357.947C156.668,360.125 156.648,361.882 156.648,362.416C156.648,362.852 156.942,363.359 157.768,363.2C164.236,361.041 168.899,354.94 168.899,347.745C168.899,338.748 161.605,331.455 152.608,331.455Z" style="fill:white;"/>
</g>
</svg>`;
