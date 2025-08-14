'use strict';

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: {
      type: 'public',
    },
  });

  if (!publicRole) {
    console.log('Public role not found, skipping permission setup');
    return;
  }

  // Create the new permissions and link them to the public role
  const allPermissionsToCreate = [];
  Object.keys(newPermissions).map((controller) => {
    const actions = newPermissions[controller];
    const permissionsToCreate = actions.map((action) => {
      return strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: `api::${controller}.${controller}.${action}`,
          role: publicRole.id,
        },
      });
    });
    allPermissionsToCreate.push(...permissionsToCreate);
  });
  await Promise.all(allPermissionsToCreate);
}

module.exports = {
  async up(knex) {
    // Add permissions for new API types
    await setPublicPermissions({
      agent: ['find', 'findOne'],
      platform: ['find', 'findOne'],
      product: ['find', 'findOne'],
      project: ['find', 'findOne'],
      client: ['find', 'findOne'],
      testimonial: ['find', 'findOne'],
      faq: ['find', 'findOne'],
      tech: ['find', 'findOne'],
      tag: ['find', 'findOne'],
      plan: ['find', 'findOne'],
      serviceType: ['find', 'findOne'],
      infra: ['find', 'findOne'],
      logo: ['find', 'findOne'],
      page: ['find', 'findOne'],
      blogPage: ['find', 'findOne'],
      productPage: ['find', 'findOne'],
      projectPage: ['find', 'findOne'],
      redirection: ['find', 'findOne'],
      site: ['find', 'findOne'],
      siteEu: ['find', 'findOne'],
      siteKr: ['find', 'findOne'],
      siteUs: ['find', 'findOne'],
      siteWww: ['find', 'findOne'],
      euPage: ['find', 'findOne'],
      krPage: ['find', 'findOne'],
      usPage: ['find', 'findOne'],
      wwwPage: ['find', 'findOne'],
    });
  },

  async down(knex) {
    // Remove permissions for new API types
    const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: {
        type: 'public',
      },
    });

    if (publicRole) {
      const apiTypes = [
        'agent', 'platform', 'product', 'project', 'client', 'testimonial',
        'faq', 'tech', 'tag', 'plan', 'serviceType', 'infra', 'logo',
        'page', 'blogPage', 'productPage', 'projectPage', 'redirection',
        'site', 'siteEu', 'siteKr', 'siteUs', 'siteWww',
        'euPage', 'krPage', 'usPage', 'wwwPage'
      ];

      for (const apiType of apiTypes) {
        await strapi.query('plugin::users-permissions.permission').delete({
          where: {
            action: {
              $in: [
                `api::${apiType}.${apiType}.find`,
                `api::${apiType}.${apiType}.findOne`
              ]
            },
            role: publicRole.id
          }
        });
      }
    }
  },
};
