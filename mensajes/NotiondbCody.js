const { Client } = require("@notionhq/client");

const notion = new Client({ auth: process.env.NOTION_API_KEY });

class NotionDBLoader {
  constructor({ databaseId, notionIntegrationToken, pageSizeLimit = 50 }) {
    this.notion = new Client({ auth: notionIntegrationToken });
    this.databaseId = databaseId;
    this.pageSizeLimit = pageSizeLimit;
  }

  async load() {
    const pages = [];
    let hasMore = true;
    let startCursor = undefined;
  
    while (hasMore) {
      notion.databases.retrieve

      const response = await notion.databases.query({
        database_id: this.databaseId,
        start_cursor: startCursor,
        page_size: this.pageSizeLimit,
      });
  
      pages.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;
    }
  
    return pages.map(page => ({
      id: page.id,
      properties: page.properties,
      // Add any other relevant data you want to extract from the page
      url: page.url,
      Nombre: page.Nombre,
      descripcion: page.descripcion
    }));
  }
  
  async listDatabases() {
    const response = await this.notion.search({
      filter: {
        value: 'database',
        property: 'object'
      },
      page_size: 100 // Adjust this value as needed
    });

    return response.results.map(database => ({
      id: database.id,
      title: database.title[0]?.plain_text || 'Untitled',
      url: database.url
    }));
  }

}

module.exports = { NotionDBLoader };


