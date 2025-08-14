'use strict';

const { createStrapi, compileStrapi } = require('@strapi/strapi');

async function checkAndSetPermissions() {
  try {
    console.log('Checking permissions for new API types...');
    
    // Public role 가져오기
    const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    if (!publicRole) {
      console.log('Public role not found');
      return;
    }

    // 필요한 API 타입들
    const requiredApiTypes = [
      'agent', 'platform', 'product', 'project', 'client', 'testimonial',
      'faq', 'tech', 'tag', 'plan', 'serviceType', 'infra', 'logo',
      'page', 'blogPage', 'productPage', 'projectPage', 'redirection',
      'site', 'siteEu', 'siteKr', 'siteUs', 'siteWww',
      'euPage', 'krPage', 'usPage', 'wwwPage'
    ];

    // 각 API 타입에 대해 권한 확인 및 설정
    for (const apiType of requiredApiTypes) {
      const actions = ['find', 'findOne'];
      
      for (const action of actions) {
        const permissionAction = `api::${apiType}.${apiType}.${action}`;
        
        // 권한이 이미 존재하는지 확인
        const existingPermission = await strapi.query('plugin::users-permissions.permission').findOne({
          where: {
            action: permissionAction,
            role: publicRole.id
          }
        });

        if (!existingPermission) {
          // 권한이 없으면 생성
          await strapi.query('plugin::users-permissions.permission').create({
            data: {
              action: permissionAction,
              role: publicRole.id,
            },
          });
          console.log(`✅ Created permission: ${permissionAction}`);
        } else {
          console.log(`ℹ️  Permission already exists: ${permissionAction}`);
        }
      }
    }
    
    console.log('Permission check and setup completed successfully!');
  } catch (error) {
    console.error('Error checking/setting permissions:', error);
    throw error;
  }
}

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  await checkAndSetPermissions();
  await app.destroy();

  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { checkAndSetPermissions };
