---
name: google-analytics
description: Master guide and workflows for implementing, curating, and analyzing Google Analytics 4 (GA4) in modern web applications (React, Vite, PWA, SPAs) and connecting to Google Analytics MCP servers via Google Cloud Console.
---

# Google Analytics 4 (GA4) Integration & Curation Skill

This skill provides comprehensive standards and actionable runbooks for integrating, curating, and querying Google Analytics 4 (GA4) in web applications.

---

## 1. Core Architecture & GA4 Data Model

Unlike Universal Analytics (which was session-based), GA4 is strictly **event-driven**:
- **Events**: Every interaction is an event (e.g. `page_view`, `click`, `club_selected`, `shot_calculated`).
- **Parameters**: Contextual metadata passed with events (up to 25 custom parameters per event).
- **User Properties**: Persistent user-level traits (e.g. `preferred_theme`, `installed_pwa`).
- **Measurement ID**: Format `G-XXXXXXXXXX` (configured via Google Tag `gtag.js`).

### Client-Side Integration Standards (React / Vite / SPA)
1. **Dynamic Injection**: Load `gtag.js` asynchronously via JavaScript; never block initial HTML rendering.
2. **Environment Configuration**: Store the Measurement ID in `VITE_GA_MEASUREMENT_ID` in `.env` / `.env.local`.
3. **Graceful Degradation**: If the ID is missing (e.g. in local dev without `.env`), log events neatly to `console.debug` and no-op without crashing or breaking tests.
4. **Ad-blocker & Offline Resiliency**: Wrap calls in safe checks so ad-blockers or PWA offline states do not throw exceptions.
5. **Debug Mode**: Pass `{ debug_mode: true }` in development so events appear in real-time in Google Analytics **Admin > DebugView**.

---

## 2. Event Curation & Taxonomy Best Practices

### Naming Conventions
- Always use `snake_case` for event names and parameter keys (e.g. `shot_calculated`, `club_name`).
- Limit event names to 40 characters; avoid spaces and special characters.
- Use semantic verb-noun or noun-action patterns:
  - Good: `club_selected`, `profile_saved`, `view_mode_changed`
  - Bad: `clickClub`, `Button Clicked`, `Action_1`

### Standard Parameters to Include
- `page_path`: Current route / virtual view
- `page_title`: Document title
- `screen_name`: Component or modal view context

### Curated Domain Taxonomy (Golf Clash Caddie's Compass Example)
| Event Name | Key Parameters | Trigger |
| :--- | :--- | :--- |
| `page_view` | `page_path`, `page_title` | App loaded, route changed |
| `club_selected` | `club_id`, `club_name`, `club_category`, `level` | Club added to bag |
| `club_level_changed` | `club_id`, `club_name`, `club_category`, `level` | Club level modified |
| `club_removed` | `club_id`, `club_name`, `club_category` | Club deleted from bag |
| `bag_cleared` | `previous_count` | All clubs removed |
| `bag_shared` | `method` (`clipboard`, `native_share`), `club_count` | Share button clicked |
| `profile_action` | `action` (`save`, `load`, `delete`, `rename`), `profile_name` | Bag profile management |
| `shot_calculated` | `club_name`, `wind_speed`, `elevation`, `ball_power`, `rings` | Wind/elevation adjusted |
| `view_mode_changed`| `mode` (`standard`, `widget`, `fullscreen`) | Layout toggle |
| `chart_variant_changed` | `variant` (`ring`, `wind`) | Unit toggle |
| `reference_toggled`| `status` (`opened`, `closed`) | Graph open/close |
| `sheet_printed` | `bag_size`, `ball_name`, `variant` | Print / PDF trigger |
| `theme_changed` | `theme` (`light`, `dark`, `system`) | Theme dropdown change |

---

## 3. Privacy, Consent & GDPR Compliance

1. **No Personally Identifiable Information (PII)**: Never log emails, IP addresses, usernames, or sensitive user inputs.
2. **Consent Mode v2**: For European/GDPR compliance, configure Google Consent Mode:
   ```javascript
   gtag('consent', 'default', {
     'analytics_storage': 'granted', // or 'denied' pending user consent
     'ad_storage': 'denied',
   });
   ```
3. **IP Anonymization**: Enabled by default in GA4 (IP addresses are discarded automatically).

---

## 4. Google Analytics MCP Server Integration

The Model Context Protocol (MCP) server for Google Analytics enables AI coding assistants (like Antigravity) to query real-time analytics data, reports, conversion funnels, and performance metrics via natural language.

### Prerequisites (Google Cloud Console & GA4)
1. **Google Cloud Console**:
   - Create or select a Google Cloud Project (e.g. `gcbags-analytics`).
   - Navigate to **APIs & Services > Library**.
   - Enable **Google Analytics Data API** (for running traffic & interaction reports).
   - Enable **Google Analytics Admin API** (for querying account and property metadata).
2. **Service Account Credentials**:
   - Go to **APIs & Services > Credentials**.
   - Click **Create Credentials > Service Account**.
   - Name it (e.g. `ga4-mcp-reader`) and create.
   - Go to the **Keys** tab > **Add Key > Create new key > JSON**.
   - Save the downloaded JSON key file securely on your machine (e.g. `C:/Users/KHB/.gemini/ga4-credentials.json`).
3. **Grant GA4 Property Access**:
   - Open [Google Analytics](https://analytics.google.com/).
   - Go to **Admin > Property Settings > Property Access Management**.
   - Click `+` > **Add Users**.
   - Enter the service account email (e.g. `ga4-mcp-reader@gcbags-analytics.iam.gserviceaccount.com`).
   - Assign the **Viewer** role.

### MCP Configuration (`mcp_config.json`)
Add the server definition to your Antigravity MCP config:
```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "python",
      "args": ["-m", "google_analytics_mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "C:/Users/KHB/.gemini/ga4-credentials.json"
      }
    }
  }
}
```
Or via Node:
```json
{
  "mcpServers": {
    "google-analytics": {
      "command": "npx",
      "args": ["-y", "@surendranb/google-analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "C:/Users/KHB/.gemini/ga4-credentials.json"
      }
    }
  }
}
```

Once configured, the agent can answer questions like:
- "What are the most popular clubs selected by users this week?"
- "How many users used Widget Mode vs Fullscreen Mode?"
- "What is our daily active user count over the past 30 days?"
