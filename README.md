## ShazAnime
A Web Application that identifies anime openings or endings from audio clips and will display its respective visuals, alongside Shazam and Apple Music links.
<br>
<br>
Live at https://shazanime.vercel.app/
#
### How it Works
<ol>
  <li>Click the microphone and play an anime song</li>
  <li>ShazamIO returns Track/Artist information</li>
  <li>Track name is matched on AnimeThemes; there are fallbacks:</li>
  <ol>
    <li>If track can't be found -> it searches the partial name of the track (ex: Hotaru no Hikari -> Hotarunohikari)</li>
    <li>If multiple tracks appear -> match with artist name</li>
    <li>If artist can't be found -> checks with artistMappings.json (ex: Nao Toyama -> Nao Touyama)</li>
    <li>If artist is not credited -> checks with songMappings.json</li>
    </ol>
  
</ol>

### Stack 
Frontend: React,TypeScript, Tailwind CSS <br> 
Backend: Python <br> 
API: [ShazamIO](https://github.com/shazamio/ShazamIO), [r/AnimeThemes (GraphQL)](https://api-docs.animethemes.moe/) <br> 


### Bugs
There are currently 2 issues:<br> 
<ol>
</li>
  <li>
    The song can't be recognized with Shazam.
  </li>
  <li>
    The song doesn't exist in AnimeThemes (ex: Legend of the Galactic Heroes Rebroadcast OP).
  </li>
</ol>
For the most part, most localization mismatches are handled with the json files that I try to update if I find songs that do not work.


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
<li>コトノハノオモイ - Sonoko Inoue (not recognizable)</li>
<li>lolite - Eve (not in AnimeThemes)</li>
<li>CRY - Sawano (not in AnimeThemes)</li>
<li>Kyomo Sakuramau Akatsukini - CHiCO (not in AnimeThemes)</li>
</ol>
