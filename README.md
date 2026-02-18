A Web Application that identifies anime openings or endings from audio clips and will display its respective visuals.

### Features
Audio Recognition of anime songs <br> 
Opening/Ending visuals <br> 
Support for songs in the r/AnimeThemes database (given that it is
recognized by Shazam) <br> 

### Stack 
Frontend: React <br> 
Backend: Python <br> 
API: [ShazamIO](https://github.com/shazamio/ShazamIO), [r/AnimeThemes](https://api-docs.animethemes.moe/) <br> 


### Bugs
It's not entirely accurate. I've deducted some reasons the audio recognition might not work. <br> 
<ol>
</li>
  <li>
    The recognized song does not have its respective artist listed on the AnimeThemes database.
  </li>
  <li>
    The recognized song does have its respective artist on the database, however, due to localization, it cannot match with the database (both artist/track name). For example, VK Blanka uses the name Vickeblanka on the AnimeThemes database. I've fixed matching for some songs thanks to the fuzzy search of the API, such as Ikimonogakari's Hotaru no Hikari with Hotarunohikari.
  </li>
</ol>


### Songs not Working:
<ol>
<li>Reset - Makino (not recognizable)</li>
<li>Do or Die - nano (not recognizable)</li>
<li>All VladLove songs (not recognizable)</li>
<li>Astride - trysail (not recognizable)</li>
<li>本日モ誠ニ晴天也 - Makoto Furukawa (not recognizable)</li>
<li>vivid brilliant door! - Sphere (not recgonizable)</li>
<li>君を救えるなら僕は何にでもなる - Maon Kurosaki (not recognizable)</li>
<li>Generation! - JAM Project (not recognizable)</li>
<li>Believe in Sky - Asami Imai (not recognizable)</li>
<li>コトノハノオモイ - Sonoko Inoue </li>
<li>illuminate - Minami Kuribayashi (no credit)</li>
<li>lolite - Eve (not in AnimeThemes)</li>
<li>Kyomo Sakuramau Akatsukini - CHiCO (not in AnimeThemes)</li>
</ol>