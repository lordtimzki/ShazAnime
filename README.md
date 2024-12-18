A Web Application that identifies anime openings or endings from audio clips and will display its respective visuals.

### Features
Audio Recognition of anime songs <br> 
Opening/Ending visuals <br> 
Support for songs in the r/AnimeThemes database (given that they match artist name) <br> 

### Stack 
Frontend: React <br> 
Backend: TypeScript <br> 
API: [AuDD](https://audd.io/), [r/AnimeThemes](https://api-docs.animethemes.moe/) <br> 


### Bugs
Not every anime song exists in the AnimeThemes database. I've deducted some reasons the audio recognition might not work. <br> 
<ol>
  <li>AuDD recognizes the wrong song
  <ul>
  <li>Sometimes, it will pick an entirely irrelevant song, pick a song that samples the anime song, or pick a complication song which includes the anime song over the individual track (EX: FLOW ANIME OP * ED Size Special Collection - FLOW) </li>
  </ul>
</li>
  <li>
    The recognized song does not have its respective artist listed on the AnimeThemes database.
  </li>
  <li>
    The recognized song does have its respective artist on the database, however, due to localization, it cannot match with the database (both artist/track name). For example, VK Blanka uses the name Vickeblanka on the AnimeThemes database. I've fixed matching for some songs thanks to the fuzzy search of the API, such as Ikimonogakari's Hotaru no Hikari with Hotarunohikari.
  </li>
</ol>
