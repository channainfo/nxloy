Feature: Loyalty Templates
  As a business owner
  I want to create loyalty programs from pre-configured templates
  So that I can launch programs quickly without technical expertise

  Background:
    Given the system has 21 loyalty templates seeded in the database
    And I am logged in as a business owner
    And my business industry is "COFFEE"

  @priority-high @mvp
  Scenario: Browse available loyalty templates
    Given I am on the templates page
    When I view the template gallery
    Then I should see at least 2 templates for my industry
    And each template should display:
      | Field          | Description                    |
      | Template name  | e.g., "Coffee Punch Card"      |
      | Rule type      | e.g., "PUNCH_CARD"             |
      | Description    | e.g., "Buy 10, get 1 free"     |
      | Estimated ROI  | e.g., "15-25% increase"        |
      | Popularity     | Number of businesses using it  |
    And templates should be sorted by popularity (descending)

  @priority-high @mvp
  Scenario: Filter templates by industry
    Given I am on the templates page
    When I select "COFFEE" from the industry filter
    Then I should see only templates for "COFFEE" industry
    And I should see "Coffee Punch Card" template
    And I should see "Espresso Points Program" template
    And I should NOT see "Retail Points Program" template

  @priority-high @mvp
  Scenario: View template details
    Given I am on the templates page
    When I click on "Coffee Punch Card" template
    Then I should be navigated to the template detail page
    And I should see the template configuration:
      | Field              | Value                    |
      | Required Punches   | 10                       |
      | Reward Type        | FREE_ITEM                |
      | Reward Value       | Free coffee              |
      | Card Name          | Coffee Punch Card        |
      | Earn Action        | Get a punch              |
    And I should see the estimated ROI: "15-25% increase in repeat visits"
    And I should see a "Create from Template" button

  @priority-high @mvp
  Scenario: Create program from template without customization
    Given I am viewing the "Coffee Punch Card" template details
    When I click "Create from Template"
    And I enter program name "My Coffee Rewards"
    And I enter description "Earn free coffee with every 10 purchases"
    And I click "Activate Program"
    Then a new loyalty program should be created with:
      | Field          | Value                                          |
      | Name           | My Coffee Rewards                              |
      | Rule Type      | PUNCH_CARD                                     |
      | Status         | ACTIVE                                         |
      | Required Punches | 10                                           |
      | Reward         | { type: "FREE_ITEM", value: "Free coffee" }    |
    And I should see a success message "Program activated successfully!"
    And I should be redirected to the programs list page
    And I should see "My Coffee Rewards" in the program list

  @priority-high @mvp
  Scenario: Create program from template with customization
    Given I am viewing the "Coffee Punch Card" template details
    When I click "Create from Template"
    And I enter program name "VIP Coffee Card"
    And I customize the configuration:
      | Field              | Original Value | New Value         |
      | Required Punches   | 10             | 12                |
      | Reward Value       | Free coffee    | Free large coffee |
    And I click "Activate Program"
    Then a new loyalty program should be created with:
      | Field            | Value              |
      | Required Punches | 12                 |
      | Reward Value     | Free large coffee  |
    And the template popularity count should increment by 1
    And a "template.used" event should be published with:
      | Field        | Value                    |
      | templateId   | <coffee-punch-card-id>   |
      | customized   | true                     |

  @priority-medium
  Scenario: Validation prevents invalid configuration
    Given I am creating a program from "Coffee Punch Card" template
    When I customize "Required Punches" to "1"
    And I click "Activate Program"
    Then I should see a validation error "Required Punches must be between 2 and 50"
    And the program should NOT be created
    And I should remain on the configuration page

  @priority-medium
  Scenario: Search templates by name
    Given I am on the templates page
    When I type "punch" in the search box
    Then I should see templates with "punch" in the name
    And I should see "Coffee Punch Card"
    And I should see "Retail Punch Card"
    And I should NOT see "Espresso Points Program"

  @priority-medium
  Scenario: Sort templates by different criteria
    Given I am on the templates page
    When I select "Name" from the sort dropdown
    And I select "Ascending" from the sort order dropdown
    Then templates should be sorted alphabetically by name
    And "Coffee Punch Card" should appear before "Espresso Points Program"

  @priority-low
  Scenario: Cache templates for performance
    Given template data is cached in Redis with 5-minute TTL
    When I request the template list
    Then the response should come from cache
    And the response time should be < 100ms
    And the database should NOT be queried

  @priority-low
  Scenario: Template list is publicly accessible
    Given I am NOT logged in
    When I navigate to "/api/v1/loyalty/templates"
    Then I should receive a 200 OK response
    And I should see the list of templates
    And authentication should NOT be required

  @priority-high @mvp
  Scenario: Program creation publishes domain events
    Given I am creating a program from a template
    When the program is successfully created
    Then a "loyalty.program.created" event should be published with:
      | Field      | Value                  |
      | programId  | <generated-uuid>       |
      | businessId | <my-business-id>       |
      | templateId | <template-id>          |
      | status     | ACTIVE                 |
    And a "loyalty.template.used" event should be published
    And the analytics service should receive both events

  @priority-medium @performance
  Scenario: System handles concurrent template browsing
    Given 1000 users are browsing templates simultaneously
    When all users request the template list
    Then all requests should complete successfully
    And 95th percentile response time should be < 200ms
    And no errors should occur

  @priority-medium @performance
  Scenario: Database query optimization with indexes
    Given the templates table has 100,000 records
    When I query templates filtered by industry "COFFEE"
    Then the database should use the "idx_templates_industry" index
    And the query execution time should be < 50ms

  @priority-high @mvp
  Scenario: Template popularity increases when used
    Given "Coffee Punch Card" template has popularity = 847
    When I create a program from "Coffee Punch Card"
    Then the template popularity should be incremented to 848
    And the template cache should be invalidated
    And subsequent template list queries should show updated popularity

  @priority-low
  Scenario: Auto-enrollment configuration from template
    Given I am creating a program from a template
    When I check "Auto-enroll customers on first purchase"
    And I activate the program
    Then the program should have enrollment settings:
      | Field            | Value |
      | autoEnroll       | true  |
      | requireConsent   | false |
      | selfEnrollEnabled| true  |

  @priority-medium
  Scenario: Multiple programs can be created from same template
    Given I have already created "Program A" from "Coffee Punch Card" template
    When I create "Program B" from the same "Coffee Punch Card" template
    Then both programs should exist independently
    And each should have its own unique ID
    And each should be able to be configured differently

  @edge-case
  Scenario: Handle template not found
    When I request template with ID "00000000-0000-0000-0000-000000000000"
    Then I should receive a 404 NOT FOUND response
    And the error message should be "Template not found"

  @edge-case
  Scenario: Handle invalid industry filter
    When I request templates with industry "INVALID_INDUSTRY"
    Then I should receive a 400 BAD REQUEST response
    And the error message should contain "Invalid industry value"

  @edge-case
  Scenario: Handle rate limit exceeded
    Given I have made 100 requests in the last minute
    When I make another request to list templates
    Then I should receive a 429 TOO MANY REQUESTS response
    And the response should include "Retry-After" header
    And the error message should be "Too many requests. Please try again in 30 seconds."

  @security
  Scenario: Only business owners can create programs
    Given I am logged in as a staff member (not owner)
    When I attempt to create a program from a template
    Then I should receive a 403 FORBIDDEN response
    And the error message should be "You do not have permission to create programs"
    And no program should be created

  @integration
  Scenario: End-to-end program creation and customer enrollment
    Given I create a program "Coffee Loyalty" from "Coffee Punch Card" template
    And the program requires 10 punches for a free coffee
    When a customer "John Doe" enrolls in the program
    And "John Doe" makes 10 qualifying purchases
    Then "John Doe" should have 10/10 punches
    And "John Doe" should be eligible for redemption
    And the business should receive a notification "Customer ready to redeem reward"
